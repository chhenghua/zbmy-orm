/**
 * Created by YY on 2016/4/18.
 */
'use strict';
var fs        = require('fs')
, path        = require('path')
, Sequelize   = require('sequelize')
, basename    = path.basename(module.filename)
, env         = process.env.NODE_ENV || 'development'
, dbs         = {}
, handler     = require('./handler');

var Instance = function(_modelName){
    this.modelName = _modelName;
}

Instance.initDB = function(_dialect, _wr, _config){

    var db = null;
    var modelType = _wr;
    if((modelType != "read")&&(modelType != "write")){
        modelType = "all";
    }
    switch(_dialect){
        case 'mysql':
            db = require('./sequelize')(_config);
            break;
        case 'mongo':
            db = require('./mongoose')(_config);
            break;
        case 'memcache':
            db = require('./memcache')(_config);
            break;
        default:
            return;
    }
    dbs[modelType][_dialect] = db;
    handler.setDBs(dbs);
};


Instance.prototype.findOne = function(_fields, _callback){
    handler(dbs, this.modelName, 'findOne', _fields, _callback);
}

Instance.prototype.add = function(_fields, _callback){
    var db = dbs['w'] || dbs['wr'];
    db[this.modelName].findOne(_fields).then(function(result) {
        return _callback(result.dataValues);
    });
}

module.exports = Instance

