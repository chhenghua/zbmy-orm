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
}

var errReturn = function(_callback){
    return function(err){
        return _callback(err, null);
    }
}

var Handler = {

    mysql: function(_method){
        switch(_method){
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
                    )
                    return _model;
                };
                break;
            case "invokeSQL":
                return function(_model, _args, _callback){
                    var sequelize = this.dbs[_model.dialect][_model.sqlType].sequelize;
                    var Sequelize = this.dbs[_model.dialect][_model.sqlType].Sequelize;
                    (function(x){
                        sequelize.query(x)
                            .spread(function(data, metadata){
                                return _callback(null, {
                                    data: data,
                                    metadata: metadata
                                });
                            })
                            .then(resultReturn(_callback))
                            .catch(errReturn(_callback));
                    }).apply(this, _args);
                    return _model;
                };
                break;
            case "findOrCreate":
                return function(_model, _args, _callback){
                    (function(x){
                        _model.findOrCreate(x)
                            .spread(function(_newModal, _created){
                                return _callback(null, {
                                    data: _newModal,
                                    created: _created
                                });
                            })
                            .catch(errReturn(_callback));
                    }).apply(this, _args);
                    return _model;
                };
                break;
            default :
                return function(_model, _args, _callback){
                    (function(x){
                        _model[_method](x)
                            .then(resultReturn(_callback))
                            .catch(errReturn(_callback));
                    }).apply(this, _args);
                    return _model;
                }
                break;
        }
    },
    mongo: function(_method){
        switch(_method){
            case "findAll":
                return function(_model, _args, _callback){
                    (function(x){
                        _model.find(x, _callback);
                    }).apply(this, _args);
                    return _model;
                }
            case "create":
                return function(_model, _args, _callback){
                    (function(x){
                        console.log(x);
                        _model.create(x, _callback);
                    }).apply(this, _args);
                    return _model;
                }
            default :
                return function(_model, _args, _callback){
                    return _model;
                }
                break;
        }
    },
    memcache: function(){

    }

};


var HandlerFactory = function(_modelName, _method, _arguments){

    var self = this, model = null, callback = _.isFunction(_arguments[_arguments.length-1])?_arguments[_arguments.length-1]:function(_r){
        return _r;
    }; delete(_arguments[_arguments.length-1]);
    //检索函数钩子
    var checkModelFunc = function(_sqlType){
        var cacheModel = modelMapping[_sqlType+"_"+_modelName];
        if(cacheModel == NOEXIST)return checkSqlType();
        if(!_.isEmpty(cacheModel) && _.isObject(cacheModel)){
            var dbName = cacheModel.dialect;
            var cacheHandler = handlerMapping[dbName+"_"+_method];
            if(_.isFunction(cacheHandler)){
                return cacheHandler(cacheModel, _arguments, callback);
            } else {
                handlerMapping[dbName+"_"+_method] = Handler[dbName](_method);
                return handlerMapping[dbName+"_"+_method](cacheModel, _arguments, callback);
            }
        };

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
        return null;
    }

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
            default :
                sqlType = "write";
                break;
        }
        return checkModelFunc(sqlType);
    }

    //检索all库是否存在model
    var checkModelInAll = function(){
        model = checkModelFunc('all');
        if(_.isNull(model)){
            modelMapping["all_"+_modelName] = NOEXIST;
            model = checkSqlType();
        }
    }

    //entrance
    checkModelInAll();

    //export
    return model;
};

var HandlerSetDBs = function(_dbs){ this.dbs = _dbs;}

exports.HandlerFactory = HandlerFactory;
exports.setDBs = HandlerSetDBs;
