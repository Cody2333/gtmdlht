###InstCar的数据库文档  
##ver 0.5
<br>
金额说明：数据库中金额的存储是Number,单位是0.01 CNY
时间说明：
<br>
###1._User  
| attribute           | type                 | description                         |
| ------------------- | -------------------- | ----------------------------------- |
| objectId            | String               |                                     |  
| mobilePhoneNumber   | String               |                                     |
| mobilePhoneVerified | Boolean              |                                     |  
| userInfo            | Pointer -> UserInfo	 | 用户信息							    |
| myDiscountCode      | String               |                                     |  
| myAgent             | Pointer -> _User     | 我的代理                             |
| agentCode           | String               | 绑定的优惠码，有可能是代理码也可能是用户优惠码 |
| balance             | Number               | 用户账户里的钱(从余额和提成中获得)     |
| isDeleted           | Boolean              |                                     |

<br>
###1.1.UserInfo
| attribute           | type                 | description                         |
| ------------------- | -------------------- | ----------------------------------- |
| objectId            | String               |                                    |
| user                | Pointer -> User      |                                    |
| school              | Pointer -> Location  |                                    |
| home                | Pointer -> Location  |                                    |
| beginnerCoupon      | Pointer -> Coupon    | 新用户优惠券                        |

<br>
###2.Location  
- 个人觉得分为college和area不清楚，地点应该用一种统一的方式去描述，所以把college改成了location  

| attribute           | type              | description            |
| ------------------- | ----------------- | ---------------------- |
| objectId            | String            |                        |  
| area                | Pointer -> Area
| location            | String            |  具体的地点(大学，地标)  |
| locationFullName    | String            |                        |  
| lng                 | Number            | 经度                   |  
| lat                 | Number            | 纬度                   |
| sourceRouteNumber   | Number  
| destRouteNumber     | Number  
| isDeleted           | Boolean           |                        |

<br>
###3.Passenger  
| attribute           | type              | description            |
| ------------------- | ----------------- | ---------------------- |
| objectId            | String            |                        |  
| user                | Pointer -> _User  |                        |
| name                | String            |                        |  
| idNumber            | String            |                        |  
| phone               | String            |                        |  
| isDeleted           | Boolean           |                        |

<br>
###4.Route
| attribute           | type              | description            |  
| ------------------- | ----------------- | ---------------------- |  
| objectId            | String            |                        |
| notice              | String            | 用户须知                 |
| source              | Pointer -> Location |  路线的起点            |  
| dest                | Pointer -> Location |  路线的终点            |
| sourceFullName      | String            | 起点全称               |
| destFullName        | String            | 终点全称               |  
| sourceLng           | Number            | 起点经度(总台可以对路线经纬度微调,但不会影响Place里的属性) |
| sourceLat           | Number            | 起点纬度               |  
| destLng             | Number            | 终点经度               |  
| destLat             | Number            | 终点纬度               |  
| sourceBusStop       | String            | 起点大巴停靠的具体位置，比如“学校东大门” |  
| destBusStop         | String            | 终点大巴停靠的具体位置 |
| carType             | Pointer -> CarType | 大巴类型              |  
| price               | Number            | 路线单价               |  
| startTime           | Date              | 出发时间               |
| duration            | Number            | 预计路线行驶时间       |
| passengerNumebr     | Number            
| isFinished          | Boolean           | 路线是否完成           |
| isDeleted           | Boolean           |                        |

<br>
###5.Schedule
| attribute           | type              | description            |
| ------------------- | ----------------- | ---------------------- |
| objectId            | String            |                        |  
| teller              | Pointer -> _User  | 检票员                 |  
| tellerName          | String            | 检票员姓名             |
| tellerPhone         | String            | 检票员手机号           |
| driverName          | String            |  司机                  |  
| driverPhone         | String            | 司机手机号             |  
| route               | Pointer -> Route  | 对应路线               |  
| plateNumber         | String            | 车牌号                 |  
| cipher              | String            | 班次暗号               |
| code                | String            | 检票账号               |
| password            | String            | 班次密码               |
| company             | String            |                        |
| totalSeat           | Number            | 该班次座位总数         |  
| takenSeat           | Number            | 已经分配的座位数量     |  
| isFinished          | Boolean           | 班次是否完成           |  
| isDeleted           | Boolean           |                        |  

<br>
###6.Order  
| attribute           | type              | description            |
| ------------------- | ----------------- | ---------------------- |
| objectId            | String            |                        |  
| user                | Pointer -> _User  |                        |  
| route               | Pointer -> Route  |                        |
| passengers          | Relation -> Passenger |                    |
| coupons             | Relation -> Coupon |                       |  
| tickets             | Relation -> Tickets |                      |
| orderNumber         | String            |                        |
| state               | String            | 订单状态：未支付(unpay),支付中(paying),支付完成(paid),退款中(cancelling),退款完成(cancelled),订单完成(finished) |  
| price               | Number  
| priceToPay          | Number   
| payback             | Number            | 余额                   |  
| isDeleted           | Boolean           |                        |

<br>
###7.Ticket
| attribute           | type              | description            |
| ------------------- | ----------------- | ---------------------- |
| objectId            | String            |                        |  
| order               | Pointer -> Order  |                        |  
| passenger           | Pointer -> Passenger |                     |  
| route               | Pointer -> Route  |                        |
| schedule            | Pointer -> Schedule |                      |  
| code                | String             | 票的码,上车核对        |  
| seatNumber          | Number             | 座位号                |
| state               | String             | 状态(unused,used,discard) |
| isDeleted           | Boolean            |                       |

<br>
###8.DiscountCode
| attribute           | type              | description            |
| ------------------- | ----------------- | ---------------------- |  
| objectId            | String            
| name                | String            | to be recognize by administration
| show                | String            | show in coupon
| type                | String            | 地推成员(member)       |
| discountRule        | Pointer -> DiscountRule | 优惠规则         |
| codeNumber          | String            | 优惠码号               |
| discountPrice       | Number            | 优惠券的折扣价格         |  
| validDate           | Date              | 优惠码有效期截止日       |   
| couponValidPrice    | number            | 优惠券限制使用价格     |
| couponValidSource   | Pointer -> Location | 优惠券有效起始地     |
| couponValidDest     | Pointer -> Location | 优惠券有效结束地点   |
| couponValidStart    | Date              | 优惠券有效期           |
| couponValidEnd      | Date              | 优惠券有效期           |
| curNumber           | Number            | 已领取的数量           |
| maxNumber           | Number            | 优惠券领取数量上限     |  
| isDeleted           | Boolean  

<br>
###9.Coupon
| attribute           | type              | description            |
| ------------------- | ----------------- | ---------------------- |  
| objectId            | String  
| name                | String            | name of the coupon, to represented in coupon page |
| user                | Pointer -> _User   
| order               | Pointer -> Order  
| type                | String            | 优惠券类型(user,agent,refund,public,member) |
| discountPrice       | Number            | 优惠券的折扣价格         |  
| discountRule        | Pointer -> DisoucntRule  
| validSource         | Pointer -> location | limitation of coupon |
| validDest           | Pointer -> Location | limitation of coupon |
| validPrice          | number            | limitation of coupon |
| validStartTime      | Date              | limitation of coupon |
| validEndTime        | Date              | limitation of coupon |
| codeNumber          | String            | code number of discount code |
| isValid             | Boolean  
| isUsed              | Boolean  
| isDeleted           | Boolean  

<br>
###10.CarSupplier
| attribute           | type              | description            |
| ------------------- | ----------------- | ---------------------- |  
| objectId            | String     
| company             | String
| isDeleted           | Boolean  

<br>
###11.CarType
| attribute           | type              | description            |
| ------------------- | ----------------- | ---------------------- |    
| objectId            | String  
| carSupplier         | Pointer -> CarSupplier,  
| type                | String            | 目前有的数据:豪华，非豪华 |
| totalSeat           | Number  
| isDeleted           | Boolean  

<br>
- 优惠券的规则  
###15.DiscountRule  
| attribute           | type              | description            |
| ------------------- | ----------------- | ---------------------- |   
| objectId            | String            |                        |  
| description         | String  
| type                | String            | refund or null
| discountFunction    | Js Function       | 优惠券的价格计算函数: params(priceBefore, discountPrice) return(moneyToPay) |  
| isDeleted           | Boolean  

<br>
- 优惠券对应的规则表
###16.DiscountRuleMap
| attribute           | type              | description            |
| ------------------- | ----------------- | ---------------------- |
| objectId            | String
| show                | String            | show in coupon         |
| type                | String            | "user", "agent"        |
| source              | Location          | 对应代理信息        |
| dest                | Location          | 对应代理信息        |
| validSource         | Pointer->Location | null表示不限定         |
| validDest           | Pointer->Location | null表示不限定         |
| validPrice          | number            | null表示不限定         |
| validTime           | number            | 有效期（单位ms）        |
| discountRule        | Pointer -> DiscountRule
| isDeleted           |



<br>
- 交易流水
###18.Transaction
| attribute           | type              | description            |
| ------------------- | ----------------- | ---------------------- |   
| objectId            | String  
| chargeId            | String            | ping++ chargeId        |  
| refundId            | String            | ping++ refundId        |  
| otherId             | String            | 如果是人工处理的就填写对应支付渠道的交易号 |
| order               | Pointer -> Order  
| transactionQuery    | Pointer -> TransactionQuery  
| user                | Pointer -> _User  | 交易对象               |   
| channel             | String            | 交易渠道               |
| amount              | Number            | 交易金额               |  
| currency            | String            | 货币种类               |  
| type                | String            | 交易类型(pay,refund,withdraw) |  
| paid                | Boolean           | 交易是否支付           |
| extra               | String            | 额外信息，支付宝为支付人的账号，微信为openId |  
| time                | Date              | 交易发生日期           |
| isDeleted           | Boolean  


<br>
- 交易请求，目前主要是退款和取款   
###19.TransactionQuery
| attribute           | type              | description            |
| ------------------- | ----------------- | ---------------------- |  
| objectId            | String            |                        |
| user                | Pointer -> _User  |                        |  
| type                | String            | "withdraw","refund"    |  
| state               | String            | "pending", "finished", "cancelled" |
| order               | Pointer -> Order  |                        |
| chargeId            | String            | 退款对应的chargeId     |
| account             | String            | 要打入钱的账户         |  
| channel             | String            | 渠道    
| amount              | Number          
| currency            | String   
| payTime             | Date              | 后台处理该请求的时间   |
| extra               | String            | 其余信息               |
| isDeleted           | Boolean    
