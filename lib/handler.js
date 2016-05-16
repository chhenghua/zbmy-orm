/**
 * Created by YY on 2016/4/19.
 */
const NOEXIST = 'noExist';
const EXCEPTION = 'Handler exception';

var _ = require("lodash");
var memMapApi = require('./memcacheMap');
var modelMapping = {};
var handlerMapping = {};

var resultReturn = function(_callback){
    return function(result){
        if(!_.isNull(result) && !_.isEmpty(result)){
            return _callback(null, result);
        } else {
            return _callback(null, null);
        }
    };
};

var errReturn = function(_callback){
    return function(err){
        return _callback(err, null);
    }
};

var memStateErr = function(_callback) {
    return _callback(new Error('Memcached Is Ended'));
};

var memKeyErr = function(_callback) {
    return _callback(new Error('Key Is Undefined'));
};





var Handler = {

    mysql: function(_method){
        switch(_method){
            case "getModel":
                return function(_model, _args, _callback){
                    return _model;
                };
                break;
            case "transaction":
                return function(_model, _args, _callback){
                    var sequelize = this.dbs[_model.dialect][_model.sqlType].sequelize;
                    var Sequelize = this.dbs[_model.dialect][_model.sqlType].Sequelize;
                    sequelize.transaction(
                        {
                            isolationLevel: _args[0].isolationLevel || Sequelize.Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
                            deferrable: _args[0].deferrable || Sequelize.Deferrable.INITIALLY_DEFERRED,
                            autocommit: _args[0].autocommit || false
                        },
                        function (t) {
                            if (_.isFunction(_callback)) {
                                return _callback(t);
                            }
                        }
                    );
                    return _model;
                };
                break;
            case "invokeSQL":
                return function(_model, _args, _callback){
                    var sequelize = this.dbs[_model.dialect][_model.sqlType].sequelize;
                    var Sequelize = this.dbs[_model.dialect][_model.sqlType].Sequelize;
                    sequelize.query.apply(_model, _args)
                        .spread(function(data, metadata){
                            return _callback(null, {
                                data: data,
                                metadata: metadata
                            });
                        })
                        .then(resultReturn(_callback))
                        .catch(errReturn(_callback));
                    return _model;
                };
                break;
            case "findOrCreate":
                return function(_model, _args, _callback){
                    _model.findOrCreate.apply(_model, _args)
                        .spread(function(_newModal, _created){
                            return _callback(null, {
                                data: _newModal,
                                created: _created
                            });
                        })
                        .catch(errReturn(_callback));
                    return _model;
                };
                break;
            case "increment":
            case "decrement":
                return function(_model, _args, _callback){
                    _model.findOne(_args[0]).then(function(model){
                        if(!_.isNull(model) && !_.isEmpty(model)){
                            // delete _args[0]
                            Array.prototype.shift.call(_args);
                            model.increment.apply(model, _args)
                                .then(resultReturn(_callback))
                                .catch(errReturn(_callback))
                        }
                    });
                    return _model;
                };
                break;
            default :
                return function(_model, _args, _callback){
                    _model[_method].apply(_model, _args)
                        .then(resultReturn(_callback))
                        .catch(errReturn(_callback));
                    return _model;
                };
                break;
        }
    },
    mongo: function(_method){
        switch(_method){
            case "findAll":
                return function(_model, _args, _callback){
                    _args = Array.prototype.slice.call(_args);
                    _args.push(_callback);
                    _model.find.apply(_model, _args);
                    return _model;
                };
                break;
            case "findOrCreate":
                return function(_model, _args, _callback){
                    (function(conditions, doc){
                        if (_.isEmpty(doc)) doc = {};
                        _model.findOne(conditions, function(e, r) {
                            if (e) return _callback(e);
                            else if (!_.isEmpty(r)) return _callback(null, r);
                            else {
                                for (var key in doc) {
                                    conditions[key] = doc[key];
                                }
                                var obj = new _model(conditions);
                                obj.save(_callback);
                            }
                        });
                    }).apply(_model, _args);
                    return _model;
                };
                break;
            case "create":
                return function(_model, _args, _callback){
                    _args = Array.prototype.slice.call(_args);
                    _args.push(_callback);
                    _model.create.apply(_model, _args);
                    return _model;
                };
                break;
            case "update":
                return function(_model, _args, _callback){
                    _args = Array.prototype.slice.call(_args);
                    _args.push(_callback);
                    _model.update.apply(_model, _args);
                    return _model;
                };
                break;
            case "count":
                return function(_model, _args, _callback){
                    _args = Array.prototype.slice.call(_args);
                    _args.push(_callback);
                    _model.count.apply(_model, _args);
                    return _model;
                };
                break;
            case "remove":
                return function(_model, _args, _callback){
                    _args = Array.prototype.slice.call(_args);
                    _args.push(_callback);
                    _model.remove.apply(_model, _args);
                    return _model;
                };
                break;
            case "increment":
                return function(_model, _args, _callback){
                    (function(conditions, fields, options){
                        if (_.isEmpty(fields)) return _callback(new Error('Invalid increment fields'));
                        var rate;
                        if (_.isEmpty(options)) rate = 1;
                        else {
                            _.forEach(options, function(v) {
                                rate = parseInt(v);
                            });
                        }
                        _model.find(conditions, function(e, r) {
                            if (e) return _callback(e);
                            else if (!_.isEmpty(r)) {
                                _.map(r, function(n) {
                                    return n[fields] = n[fields] + rate;
                                });
                                _.forEach(r, function(n) {
                                    n.save();
                                });
                                return _callback(null, r);
                            }
                            else {
                                return _callback(null, []);
                            }
                        });
                    }).apply(_model, _args);
                    return _model;
                };
                break;
            case "decrement":
                return function(_model, _args, _callback){
                    (function(conditions, fields, options){
                        if (_.isEmpty(fields)) return _callback(new Error('Invalid decrement fields'));
                        var rate;
                        if (_.isEmpty(options)) rate = 1;
                        else {
                            _.forEach(options, function(v) {
                                rate = parseInt(v);
                            });
                        }
                        _model.find(conditions, function(e, r) {
                            if (e) return _callback(e);
                            else if (!_.isEmpty(r)) {
                                _.map(r, function(n) {
                                    return n[fields] = n[fields] - rate;
                                });
                                _.forEach(r, function(n) {
                                    n.save();
                                });
                                return _callback(null, r);
                            }
                            else {
                                return _callback(null, []);
                            }
                        });
                    }).apply(_model, _args);
                    return _model;
                };
                break;
            default :
                return function(_model, _args, _callback){
                    return _model;
                };
                break;
        }
    },
    memcache: function(_method){
        switch(_method) {
            case "findAll":
                return function(memModel, _args, _callback){
                    (function(findValue){
                        var _client = memModel.client;
                        var modelName = memModel.modelName;
                        var model = memModel.model;
                        try {
                            var mapSerData = memMapApi.serialization(modelName, model, findValue);
                            var key = mapSerData.key;
                        } catch(e) {
                            return _callback(e);
                        }
                        if (_client.isReady !== true) return memStateErr(_callback);
                        else if (_.isEmpty(key)) return memKeyErr(_callback);
                        else {
                            _client.get(key, function(err, v, k) {
                                if (v == null || v == undefined) v = {};
                                else {
                                    v = memMapApi.deserialization(v);
                                }
                                return _callback(err, v);
                            });
                        }
                    }).apply(memModel, _args);
                    return memModel;
                };
                break;
            case "create":
                return function(memModel, _args, _callback){
                    (function(insetValue, expires) {
                        var _client = memModel.client;
                        var modelName = memModel.modelName;
                        var model = memModel.model;
                        try {
                            var mapSerData = memMapApi.serialization(modelName, model, insetValue);
                            var key = mapSerData.key;
                            var value = mapSerData.value;
                        } catch(e) {
                            return _callback(e);
                        }
                        if (_client.isReady !== true) return memStateErr(_callback);
                        else {
                            _client.set(key, value, function(sErr) {
                                if (sErr) return _callback(sErr);
                                else {
                                    _client.get(key, function(gErr, gV, gK) {
                                        gV = memMapApi.deserialization(gV);
                                        gV = _.assign(gV, {_id: key});
                                        return _callback(gErr, gV);
                                    });
                                }
                            });
                        }
                    }).apply(memModel, _args);
                    return memModel;
                };
                break;
            case "update":
                return function(memModel, _args, _callback){
                    (function(findValue, updateValue) {
                        var _client = memModel.client;
                        var modelName = memModel.modelName;
                        var model = memModel.model;
                        try {
                            var mapSerData = memMapApi.serialization(modelName, model, findValue);
                            var key = mapSerData.key;
                        } catch(e) {
                            return _callback(e);
                        }
                        if (_client.isReady !== true) return memStateErr(_callback);
                        else {
                            _client.get(key, function(gErr, gV, gK) {
                                if (gErr) return _callback(gErr);
                                else {
                                    gV = memMapApi.deserialization(gV);
                                    _.forEach(gV, function (v1, k1) {
                                        _.forEach(updateValue, function(v2, k2) {
                                           if (k2 == k1) gV[k1] = v2;
                                        });
                                    });
                                    gV = JSON.stringify(gV);
                                    _client.set(key, gV, function(sErr) {
                                        if (sErr) return _callback(sErr);
                                        else {
                                            _client.get(key, function(getErr, getV, getK) {
                                                getV = memMapApi.deserialization(getV);
                                                return _callback(getErr, getV);
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    }).apply(memModel, _args);
                    return memModel;
                };
                break;
            case "remove":
                return function(memModel, _args, _callback){
                    (function(delValue) {
                        var _client = memModel.client;
                        var modelName = memModel.modelName;
                        var model = memModel.model;
                        try {
                            var mapSerData = memMapApi.serialization(modelName, model, delValue);
                            var key = mapSerData.key;
                        } catch(e) {
                            return _callback(e);
                        }
                        if (_client.isReady !== true) return memStateErr(_callback);
                        else {
                            _client.delete(key, _callback);
                        }
                    }).apply(memModel, _args);
                    return memModel;
                };
                break;
            case "increment":
                return function(memModel, _args, _callback){
                    (function(incValue, field, options) {
                        var _client = memModel.client;
                        var modelName = memModel.modelName;
                        var model = memModel.model;
                        try {
                            var mapSerData = memMapApi.serialization(modelName, model, incValue);
                            var key = mapSerData.key;
                        } catch(e) {
                            return _callback(e);
                        }
                        if (_client.isReady !== true) return memStateErr(_callback);
                        if (field.trim() == '' || field == null || field == undefined) return _callback(new Error('increment parameter field is required'));
                        else {
                            var rate;
                            if (_.isEmpty(options)) rate = 1;
                            else {
                                _.forEach(options, function(v) {
                                    rate = parseInt(v);
                                });
                            }
                            _client.get(key, function(gErr, gV, gK) {
                                if (gErr) return _callback(gErr);
                                else {
                                    gV = memMapApi.deserialization(gV);
                                    gV[field] = parseInt(gV[field]) + rate;
                                    gV = JSON.stringify(gV);
                                    _client.set(key, gV, function(sErr) {
                                        if (sErr) return _callback(sErr);
                                        else {
                                            _client.get(key, function(getErr, getV, getK) {
                                                getV = memMapApi.deserialization(getV);
                                                return _callback(getErr, getV);
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    }).apply(memModel, _args);
                    return memModel;
                };
                break;
            case "decrement":
                return function(memModel, _args, _callback){
                    (function(decValue, field, options) {
                        var _client = memModel.client;
                        var modelName = memModel.modelName;
                        var model = memModel.model;
                        try {
                            var mapSerData = memMapApi.serialization(modelName, model, decValue);
                            var key = mapSerData.key;
                        } catch(e) {
                            return _callback(e);
                        }
                        if (_client.isReady !== true) return memStateErr(_callback);
                        if (field.trim() == '' || field == null || field == undefined) return _callback(new Error('decrement parameter field is required'));
                        else {
                            var rate;
                            if (_.isEmpty(options)) rate = 1;
                            else {
                                _.forEach(options, function(v) {
                                    rate = parseInt(v);
                                });
                            }
                            _client.get(key, function(gErr, gV, gK) {
                                if (gErr) return _callback(gErr);
                                else {
                                    gV = memMapApi.deserialization(gV);
                                    gV[field] = parseInt(gV[field]) - rate;
                                    gV = JSON.stringify(gV);
                                    _client.set(key, gV, function(sErr) {
                                        if (sErr) return _callback(sErr);
                                        else {
                                            _client.get(key, function(getErr, getV, getK) {
                                                getV = memMapApi.deserialization(getV);
                                                return _callback(getErr, getV);
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    }).apply(memModel, _args);
                    return memModel;
                };
                break;
            default :
                return function(_model, _args, _callback){
                    return _model;
                };
                break;
        }
    }
};


var HandlerFactory = function(_modelName, _method, _arguments){
    var self = this, model = null, callback = _.isFunction(_arguments[_arguments.length-1])?_arguments[_arguments.length-1]:function(_r){
        return _r;
    };delete(_arguments[_arguments.length-1]);_arguments.length -= 1;
    //检索函数钩子
    var checkModelFunc = function(_sqlType){
        var cacheModel = modelMapping[_sqlType+"_"+_modelName];
        if(cacheModel == NOEXIST)checkSqlType();
        if(!_.isEmpty(cacheModel) && _.isObject(cacheModel)){
            var dbName = cacheModel.dialect;
            // 获取缓存处理方法
            var cacheHandler = handlerMapping[dbName+"_"+_method];
            model = cacheModel;
            if(_.isFunction(cacheHandler)){
                cacheHandler(cacheModel, _arguments, callback);
            } else {
                handlerMapping[dbName+"_"+_method] = Handler[dbName](_method);
                handlerMapping[dbName+"_"+_method](cacheModel, _arguments, callback);
            }
        }else{
            var dbs = self.dbs[_sqlType];
            _.mapKeys(dbs, function(value, key){
                model = value[_modelName];
                // 判断是否为memcache
                if(!_.isEmpty(model) && _.isObject(model) && key == 'memcache') {
                    var memDb = dbs['memcache'];
                    var memModel = {
                        model: model,
                        modelName: _modelName,
                        client: memDb.client
                    };
                    var methodFunc = Handler[key](_method);
                    return methodFunc(memModel, _arguments, callback);
                }
                if(!_.isEmpty(model) && _.isObject(model)) {
                    model.sqlType = _sqlType;
                    // 缓存model
                    modelMapping[_sqlType + "_" + _modelName] = model;
                    // 缓存handle
                    handlerMapping[key + "_" + _method] = Handler[key](_method);
                    handlerMapping[key + "_" + _method](model, _arguments, callback);
                }
            });
        }
        // return model;
    };

    //检索read，write库是否存在model
    var checkSqlType = function(){
        var sqlType = "";
        switch(_method) {
            //read
            case 'findAll':
            case 'findAndCount':
            case 'count':
            case 'max':
            case 'min':
            case 'sum':
                sqlType = "read";
                break;
            //write
            case 'findOrCreate':
            case 'create':
            case 'update':
            case 'remove':
            case 'increment':
            case 'decrement':
            case 'bulkCreate':
            case 'transaction':
            case 'invokeSQL':
            //read in write for transaction and sql
            case 'w_findAll':
            case 'w_findAndCount':
            case 'w_count':
            case 'w_max':
            case 'w_min':
            case 'w_sum':
                sqlType = "write";
                break;
            default :
                sqlType = "write";
                break;
        }
        checkModelFunc(sqlType);
    };

    //检索all库是否存在model
    var checkModelInAll = function(){
        checkModelFunc('all');
        if(_.isNull(model)){
            modelMapping["all_"+_modelName] = NOEXIST;
            checkSqlType();
            if(_.isNull(model)){
                return null;
            }
        }

    };

    //entrance
    checkModelInAll();

    //export
    return model;
};

var HandlerSetDBs = function(_dbs){ this.dbs = _dbs;};

exports.HandlerFactory = HandlerFactory;
exports.setDBs = HandlerSetDBs;
