var AV = require('leanengine');
var moment = require('moment');
var Order = AV.Object.extend('Order');
var TransactionQuery = AV.Object.extend('TransactionQuery');
var Transaction = AV.Object.extend('Transaction');
var DiscodeMap = AV.Object.extend('DiscountRuleMap');
var Coupon = AV.Object.extend('Coupon');
var commonRes = require('../common-response');

var orderMethod = require('./order');
var transactionMethod = require('../transaction/transaction');
var ticketMethod = require('../ticket/ticket');
var timeLine = require('../time-line');

var router = require('express').Router();
var pingpp = require('pingpp')('sk_test_zDSmbDS8eHC0nXTGe9O8OOeP');
var password = "JIKE193473KKKKK2928273747";


/*支付的api，向ping++服务器发送支付请求，将返回的charge对象转发给用户
params	:orderId,channel
return	:{
			err,
			ret:charge
		}
*/
router.post('/pay', function(req, res) {
  var orderId = req.body.orderId;
  var channel = req.body.channel;
  var query = new AV.Query(Order);
  query.get(orderId).then(function(order) {
    if (order.get('state') == 'paying') {
      var query = new AV.Query(Transaction);
      query.equalTo('order', order);
      query.find().then(function(results) {
        if (results.length == 0) {
          res.json({
            err: {
              code: 3,
              des: '正在支付中，请不要重复支付'
            }
          });
        }
        pingpp.charges.retrieve(results[0].get('chargeId'), function(err, charge) {
          if (charge != null) {
            res.json({
              err: {
                code: 0,
                des: ""
              },
              ret: {
                charge: charge
              }
            });
          } else {
            commonRes.unknownError(res, 300, err);
          }
        });
      });
    }
    if (order.get('state') == 'unpay') {
      var extra = {};
      var startindex = req.ip.lastIndexOf(':');
      var ip;
      if (startindex == -1) {
        ip = req.ip;
      } else {
        ip = req.ip.substring(startindex + 1);
      }

      extra = {
        open_id: req.session.wxOpenid
      }
      pingpp.charges.create({
        subject: "Jike Tickets",
        body: 'tickets of jike bus',
        amount: order.get('priceToPay'),
        order_no: order.get('orderNumber'),
        channel: 'wx_pub',
        currency: 'cny',
        client_ip: ip,
        app: {
          id: "app_avffjPTSe500OSCK"
        },
        time_expire: moment(order.createdAt).add(1, 'h').unix(),
        extra: extra,
        description: password
      }, function(err, charge) {
        if (charge == null) {
          commonRes.unknownError(res, 300, err);
        } else {
          res.json({
            err: {
              code: 0,
              des: ""
            },
            ret: {
              charge: charge
            }
          });
          transactionMethod.logOrderPayTransactionP(order, charge, false).catch(function(err) {
            console.error('create pay transaction error at order : ' + order.id);
            console.error('err :' + err.message);
          });
        }
      });
    }
  });
});



router.post('/cancelPay', function(req, res) {
  res.send('还未实现');
});


/*接受ping++支付结果,设置相应order为“paid”状态，并记录transaction
*/
router.post('/transaction/pay', function(req, res) {
  var charge = req.body.data.object;
  var order;
  var promise = AV.Promise.as();
  console.log('charge :' + charge.id);
  if (charge.description != password) {
    res.status(404);
    res.sendStatus(404);
    return;
  }
  promise = promise.then(function() {
    var query = new AV.Query(Order);
    query.equalTo('orderNumber', charge.order_no);
    query.include('route');
    query.include('user');
    return query.find();
  });
  promise = promise.then(function(results) {
    if (results.length != 1) {
      return AV.Promise.error('查找到的订单数为: ' + results.length);
    }
    order = results[0];
    if (order.get('state') == 'paid') {
      return AV.Promise.error('订单已支付');
    }
    if (charge.paid) {
      console.log('pay order :' + order.get('orderNumber'))
      AV.Cloud.requestSmsCode({
        mobilePhoneNumber: order.get('user').get('mobilePhoneNumber'),
        template: "orderPaySmsV2",
        orderNumber: order.get('orderNumber')
      }).then(function() {
        console.log("发送成功");
      }, function(err) {
        console.log("发送失败" + err);
      });
      return orderMethod.payOrderP(order);
    } else {
      if (order.get('state') == 'paying') {
        order.set('state', 'unpay');
        return order.save();
      }
    }
  });
  promise = promise.then(function() {
    return transactionMethod.logOrderPayTransactionP(order, charge, true);
  });
  promise.then(function() {
    res.status(200);
    res.sendStatus(200);
  }, function(error) {
    console.log(error.toString());
    res.status(200);
    res.sendStatus(200);
  })
});

//接受ping++退款成功接口，设置对应order为“cancelled”状态，设置transactionQuery为“finished”状态，并记录transaction
router.post('/transaction/refund', function(req, res) {
  var refundObj = req.body.data.object;
  var chargeId = refundObj.charge;
  console.log('退款请求:');
  console.log('chargeId :' + chargeId);
  if (refundObj.status == 'pending') {
    console.log('等待ping++处理结果');
    if (refundObj.failure_msg != null) {
      var query = new AV.Query(TransactionQuery);
      query.equalTo('chargeId', chargeId);
      query.equalTo('state', 'pending');
      query.find().then(function(trQuery) {
        if (trQuery.length == 0) {
          console.error('未查找到对应的transaction query');
          return;
        }
        if (typeof refundObj.failure_msg === 'string') {
          trQuery[0].set('extra', refundObj.failure_msg);
        } else {
          trQuery[0].set('extra', JSON.stringify(refundObj.failure_msg));
        }
        trQuery[0].save();
      }, function(error) {
        console.error(error);
      });
    }
  } else if (refundObj.succeed) {

    var query = new AV.Query(TransactionQuery);
    query.equalTo('chargeId', chargeId);
    query.equalTo('state', 'pending');
    query.find().then(function(trQuery) {
      if (trQuery.length == 0) {
        console.error('未查找到对应的transaction query');
        return;
      }
      console.log('ping++已处理');
      trQuery[0].set('state', 'finished');
      transactionMethod.logOrderRefundTransactionP(trQuery[0], refundObj).then(function() {
        return trQuery[0].get('order').fetch();
      }).then(function(order) {
        order.set('state', 'cancelled');
        return order.save();
      }).catch(function(error) {
        console.error(error);
      });
    }, function(error) {
      console.error(error);
    })
  }
  res.sendStatus(200);
});

router.get('/test/alipaysucceeded', function(req, res) {
  res.send('支付宝支付成功');
});

router.get('/test/alipaycancelled', function(req, res) {
  res.send('支付宝支付取消');
});


module.exports = router;
