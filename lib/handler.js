/**
 * Created by YY on 2016/4/19.
 */

Handler = {
    create: function(_model, _fields, _callback){

    },
    delete: function(){

    },
    update: function(){

    },
    findOne: function(_model, _fields, _callback){
        _model.findOne(_fields).then(function(result){
            if(result != null && typeof(result) != "undefined"){
                return _callback({
                    err: null,
                    data: result.dataValues
                });
            } else {
                return _callback({
                    err: "handle findOne error",
                    data: null
                });
            }
        });
    }
};

HandlerFactory = function(_dbs, _modelName, _method, _fields, _callback){

    var sqlType = "";
    switch(_method){
        case 'findOne':
        case 'findList':
            sqlType = "read";
            break;
    }

    var dbs = this.dbs[sqlType] || this.dbs['all'];
    Object.keys(dbs).forEach(function(_dbIndex){
        var db = dbs[_dbIndex];
        var model = db[_modelName];
        if(model != null && typeof(model) != 'undefined'){
            Handler[_method](model, _fields, _callback);
        }
    });
};


exports.HandlerFactory = HandlerFactory;
exports.setDBs = function(_dbs){
    this.dbs = _dbs;
};
