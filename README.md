## 中北明夷ORM
---
##### 安装
```sh
npm install zbmy-orm
```
##### 初始化db，这里区分读写库。
```js
var writeConfig = {
    database: 'dbName',
    username: "xxx",
    password: "xxx",
    ......
    modelPath: path.join(__dirname, 'models') //这里标识model数据模板存储位置，绝对路径。
};
var orm = require('zbmy-orm');
orm.init('mysql','read', writeConfig);//P1为自定义名称，P2为读写类型（read，write，all），P3为数据库参数配置，基本参照sequelize的标准，需要注意modelPath参数；
```
##### model定义
```js
"use strict"
var Sequelize = require('sequelize');
 
module.exports = function(sequelize){
    var Company = sequelize.define('company',{
        _id: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV1
        },
        openid: {
            type: Sequelize.STRING
        }
    },{
        freezeTableName: true,
        timestamps: false,
        paranoid: true,
        underscored: true
    });
    return Company;
}
```
##### 业务逻辑
```js
//findAll方法
orm('gamer').findAll({where:{_id:"xxx"}}, function(err, result){
    //err 错误信息
    //result 数据信息
});
//事务
orm('gamer').transaction({isolationLevel: "xxxx", deferrable: "xxx", autocommit: false}, function(t){
    orm('gamer').findAll({where: {_id: "xxx"}}, {transaction: t}, function(err, result){
        if(err){t.rollback();}
        t.commit();
    });
});
//sql query
orm('gamer').invokeSQL({sql: "xxx", options: {}}, function(err, result){
    /*
    result = {
        data: data,
        metadata: metadata
    }
    */
});

```

##### API 支持
* read方法:  
    find  
    findOrCountAll  
    count  
    max  
    min  
    sum  
* write方法:  
    findOrCreate  
    create  
    update  
    remove  
    increment  
    decrement  
    bulkCreate  
    transaction  
    invokeSQL  
* read in write for transaction and sql  
    w_findAll  
    w_findOrCountAll  
    w_count  
    w_max  
    w_min  
    w_sum  

