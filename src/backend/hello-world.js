var AV = require('leanengine');
var hwtest = require('express').Router();
var HelloWorld = AV.Object.extend("HelloWorld");
var create="(function (){ function printHello(times){var str='hello world,this is the '+times+' time!';console.log(str);return str;}this.printHello=printHello;return this;})()";


hwtest.get('/hello',function(req,res){
	var query = new AV.Query(HelloWorld);
	query.find().then(function(result){
		if(result.length==0){
			var hello= new HelloWorld;
			hello.set('times',0);
			hello.set('helloFun',create);
			console.log('saving');
			return hello.save();
		}
		else{
			console.log('ready to hello!')
		}
	}).then(function(result){
		res.send('hello!');
		console.log('hello!');
	},function(error){
		console.log('SB!');
		res.send('SB!');
	});
});

hwtest.get('/hey',function(req,res){
	var query = new AV.Query(HelloWorld);
	query.find().then(function(result){
		if(result.length!=0){
			var helloWorld=result[0];
			var helloFun=helloWorld.get('helloFun');
			console.log(helloFun);
			helloFun=eval(helloFun);
			var times=helloWorld.get('times');
			var answer=helloFun.printHello(times);
			times++;
			helloWorld.set('times',times);
			res.send(answer);
			return helloWorld.save();
		}
	}).then(null,function(error){
		console.log('update error');
	});
});

module.exports=hwtest;