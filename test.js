/**
 * Created by YY on 2016/4/21.
 */
var S = require('./index');
var path = require('path');
var readConfig = {
    database: 'ORM',
    username: "root",
    password: "12dianch",
    options: {
        host: "localhost",
        dialect: 'mysql',
        logging: false,
        pool: {
            maxConnections: 300,
            minConnections: 0,
            maxIdleTime: 30 * 1000
        }
    },
    queue: true,
    maxConcurrentQueries: 150,
    modelPath: path.join(__dirname, 'models')
};

var writeConfig = {
    database: 'ORM',
    username: "root",
    password: "12dianch",
    options: {
        host: "localhost",
        dialect: 'mysql',
        logging: false,
        pool: {
            maxConnections: 300,
            minConnections: 0,
            maxIdleTime: 30 * 1000
        }
    },
    queue: true,
    maxConcurrentQueries: 150,
    modelPath: path.join(__dirname, 'models', 'mysqlModel')
};

var model = null;
// S.init('mysql', 'read', readConfig);
// S.init('mysql', 'write', writeConfig);


//model = S('gamer').findAll({where: {_id: "xxx"}}, function(result){
//    console.log(result);
//});
//model = S('gamer').create({openid: "test"}, function(err, result){
//    console.log(err);
//    console.log(result.dataValues);
//});

function handle (err, result, result1, result2) {
    console.log('callback exec');
    if (err) {
        console.log('--------------mongo err---------------');
        console.log(err.message || err);
        console.log('------------mongo err end-------------');
    } else {

        console.log('------------mongo success-------------');
        console.log(result);
        
        if (typeof result1 !== 'undefined') {
            console.log(result1);
        }
        if (typeof result2 !== 'undefined') {
            console.log(result2);
        }

    }
}


var mongoConfig = {
    mongoHost: "localhost",
    mongoName: "ORM",
    modelPath: path.join(__dirname, 'models', 'mongoModel'),
    // modelPath: path.join(__dirname, 'models', 'memcacheModel'),
    scriptExt: "js"
};


// S.init('mongo', 'all', mongoConfig);

// S('user').create({name: 'wgj', openId: '888'}, {name: 'some', openId: '999'}, handle);
// S('user').findAll({name: 'wgj', openId: '888'}, handle);
// S('user').update({name: 'wgj', openId: '888'}, {name: '123'}, { multi: true }, handle);

// S('user').findOrCreate({name: '0001'}, {openId: '9871'}, handle);


// S('user').create({name: 'wz', age: 30}, handle);

// S('user').increment({name: 'wz'}, 'age', {by: 2}, handle);


// console.log(123);
// console.log(S('user'));
// console.log(123 + 'end');


var memConfig = {
    port: '11211',
    host: '4d1a65925d1a43d4.m.cnszalist3pub001.ocs.aliyuncs.com',
    username: '4d1a65925d1a43d4',
    password: 'Zbmy2014',
    modelPath: path.join(__dirname, 'models', 'memcacheModel'),
    scriptExt: 'js'
};

S.init('memcache', 'all', memConfig);


setTimeout(function() {
    S('userInfo').create({name:'wgj', age:27}, function(err, result) {
        console.log('memcache create result:::::::::::::::::::::::::::::');
        console.log(err);
        console.log(result);
    });
}, 1000);

setTimeout(function () {
    S('userInfo').findAll({name: 'wgj'}, function(err, result) {
        console.log('memcache findAll result:::::::::::::::::::::::::::::');
        console.log(err);
        console.log(result);
    });
}, 3000);


setTimeout(function () {
    S('userInfo').increment({name:'wgj'}, 'age', {by: 3}, function(err, result) {
        console.log('memcache increment result:::::::::::::::::::::::::::::');
        console.log(err);
        console.log(result);
    });
}, 5000);


setTimeout(function () {
    S('userInfo').update({name:'wgj'}, {age: 100}, function(err, result) {
        console.log('memcache update result:::::::::::::::::::::::::::::');
        console.log(err);
        console.log(result);
    });
}, 7000);


setTimeout(function () {
    S('userInfo').remove({name:'wgj'}, function(err, result) {
        console.log('memcache remove result:::::::::::::::::::::::::::::');
        console.log(err);
        console.log(result);

        S('userInfo').findAll({name: 'wgj'}, function(err1, result1) {
            console.log('memcache remove  findAll result:::::::::::::::::::::::::::::');
            console.log(err1);
            console.log(result1);
        });
    });
}, 10000);
