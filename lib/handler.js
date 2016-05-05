/**
 * Created by YY on 2016/4/19.
 */
const NOEXIST = 'noExist';
const EXCEPTION = 'Handler exception';

var _ = require("lodash");
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
    return _callback(new Error('MemachedIsEnded'));
};

var memKeyErr = function(_callback) {
    return _callback(new Error('KeyIsUndefined'));
};





var Handler = {

    mysql: function(_method){
        switch(_method){
            case "getModel":
                return function(_model, _args, _callback){
                    return _model;
                }
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
                return function(_client, _args, _callback){
                    (function(key){
                        if (_client.isReady !== true) return memStateErr(_callback);
                        else if (_.isEmpty(key)) return memKeyErr(_callback);
                        else {
                            _client.get(key, function(err, v, k) {
                                return _callback(err, v);
                            });
                        }
                    }).apply(_client, _args);
                    return _client;
                };
                break;
            case "create":
                return function(_client, _args, _callback){
                    (function(key, value, expires) {
                        if (_client.isReady !== true) return memStateErr(_callback);
                        else if (_.isEmpty(key)) return memKeyErr(_callback);
                        else {
                            expires = expires || null;
                            _client.set(key, value, expires, function(sErr) {
                                if(sErr) return _callback(sErr);
                                else {
                                    _client.get(key, function(gErr, v, k) {
                                        return _callback(gErr, v);
                                    });
                                }
                            });
                        }
                    }).bind(_client, _args);
                    return _client;
                };
                break;
            case "findOrCreate":
                return function(_client, _args, _callback){
                    (function(key, value, expires) {
                        if (_client.isReady !== true) return memStateErr(_callback);
                        else if (_.isEmpty(key)) return memKeyErr(_callback);
                        else {
                            _client.get(key, function(gErr, v, k) {
                                if (gErr) return _callback(gErr);
                                else if (!_.isEmpty(v)) return _callback(gErr, v);
                                else {
                                    expires = expires || null;
                                    _client.add(key, value, expires, function(aErr) {
                                        if (aErr) return _callback(aErr);
                                        else {
                                            _client.get(key, function(gError, rV, rK) {
                                                return _callback(gError, rV);
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    }).bind(_client, _args);
                    return _client;
                };
                break;
            case "update":
                return function(_client, _args, _callback){
                    (function(key, value, expires) {
                        if (_client.isReady !== true) return memStateErr(_callback);
                        else if (_.isEmpty(key)) return memKeyErr(_callback);
                        else {
                            expires = expires || null;
                            _client.replace(key, value, expires, _callback);
                        }
                    }).bind(_client, _args);
                    return _client;
                };
                break;
            case "remove":
                return function(_client, _args, _callback){
                    (function(key) {
                        if (_client.isReady !== true) return memStateErr(_callback);
                        else if (_.isEmpty(key)) return memKeyErr(_callback);
                        else {
                            _client.delete(key, _callback);
                        }
                    }).bind(_client, _args);
                    return _client;
                };
                break;
            case "increment":
                return function(_client, _args, _callback){
                    (function(key, options, expires) {
                        if (_client.isReady !== true) return memStateErr(_callback);
                        else if (_.isEmpty(key)) return memKeyErr(_callback);
                        else {
                            expires = expires || null;
                            var rate;
                            if (_.isEmpty(options)) rate = 1;
                            else {
                                _.forEach(options, function(v) {
                                    rate = parseInt(v);
                                });
                            }
                            _client.increment(key, rate, expires, function(err, state, iV) {
                                if (err) return _callback(err);
                                else return _callback(err, iV);
                            });
                        }
                    }).bind(_client, _args);
                    return _client;
                };
                break;
            case "decrement":
                return function(_client, _args, _callback){
                    (function(key, options, expires) {
                        if (_client.isReady !== true) return memStateErr(_callback);
                        else if (_.isEmpty(key)) return memKeyErr(_callback);
                        else {
                            expires = expires || null;
                            var rate;
                            if (_.isEmpty(options)) rate = 1;
                            else {
                                _.forEach(options, function(v) {
                                    rate = parseInt(v);
                                });
                            }
                            _client.decrement(key, rate, expires, function(err, state, iV) {
                                if (err) return _callback(err);
                                else return _callback(err, iV);
                            });
                        }
                    }).bind(_client, _args);
                    return _client;
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
            var cacheHandler = handlerMapping[dbName+"_"+_method];
            if(_.isFunction(cacheHandler)){
                return cacheHandler(cacheModel, _arguments, callback);
            } else {
                handlerMapping[dbName+"_"+_method] = Handler[dbName](_method);
                return handlerMapping[dbName+"_"+_method](cacheModel, _arguments, callback);
            }
        }

        var dbs = self.dbs[_sqlType];
        _.mapKeys(dbs, function(value, key){
            model = value[_modelName];
            if(!_.isEmpty(model) && _.isObject(model)){
                model.sqlType = _sqlType;
                modelMapping[_sqlType+"_"+_modelName] = model;
                handlerMapping[key+"_"+_method] = Handler[key](_method);
                return handlerMapping[key+"_"+_method](model, _arguments, callback);
            }
        });
        //return model;
    };

    //检索read，write库是否存在model
    var checkSqlType = function(){
        var sqlType = "";
        switch(_method) {
            //read
            case 'findAll':
            case 'findOrCountAll':
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
            case 'w_findOrCountAll':
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
