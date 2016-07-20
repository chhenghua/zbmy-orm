/**
 * Created by YY on 2016/4/18.
 */
var handler = require("./handler");
function Instance(_modelName){
    this.modelName = _modelName;
}

Instance.prototype = {
    getModel: function(){
        return handler.HandlerFactory(this.modelName, 'getModel', arguments);
    },
    getSequelize: function(){
        return handler.HandlerFactory(this.modelName, 'getSequelize', arguments);
    },
    findAll: function(){
        return handler.HandlerFactory(this.modelName, 'findAll', arguments);
    },
    findOne: function(){
        return handler.HandlerFactory(this.modelName, 'findOne', arguments);
    },
    findOrCreate: function(){
        return handler.HandlerFactory(this.modelName, 'findOrCreate', arguments);
    },
    findAndCount: function(){
        return handler.HandlerFactory(this.modelName, 'findAndCount', arguments);
    },
    count: function(){
        return handler.HandlerFactory(this.modelName, 'count', arguments);
    },
    max: function(){
        return handler.HandlerFactory(this.modelName, 'max', arguments);
    },
    min: function(){
        return handler.HandlerFactory(this.modelName, 'min', arguments);
    },
    sum: function(){
        return handler.HandlerFactory(this.modelName, 'sum', arguments);
    },
    create: function(){
        return handler.HandlerFactory(this.modelName, 'create', arguments);
    },
    update: function(){
        return handler.HandlerFactory(this.modelName, 'update', arguments);
    },
    destroy: function(){
        return handler.HandlerFactory(this.modelName, 'destroy', arguments);
    },
    increment: function(){
        return handler.HandlerFactory(this.modelName, 'increment', arguments);
    },
    decrement: function(){
        return handler.HandlerFactory(this.modelName, 'decrement', arguments);
    },
    bulkCreate: function(){
        return handler.HandlerFactory(this.modelName, 'bulkCreate', arguments);
    },
    transaction: function(){
        return handler.HandlerFactory(this.modelName, 'transaction', arguments);
    },
    invokeSQL: function(){
        return handler.HandlerFactory(this.modelName, 'invokeSQL', arguments);
    },
    w_findAll: function(){
        return handler.HandlerFactory(this.modelName, 'w_findAll', arguments);
    },
    w_findOne: function(){
        return handler.HandlerFactory(this.modelName, 'w_findOne', arguments);
    },
    w_findAndCount: function(){
        return handler.HandlerFactory(this.modelName, 'w_findAndCount', arguments);
    },
    w_count: function(){
        return handler.HandlerFactory(this.modelName, 'w_count', arguments);
    },
    w_max: function(){
        return handler.HandlerFactory(this.modelName, 'w_max', arguments);
    },
    w_min: function(){
        return handler.HandlerFactory(this.modelName, 'w_min', arguments);
    },
    w_sum: function(){
        return handler.HandlerFactory(this.modelName, 'w_sum', arguments);
    }
};

module.exports = function(_modelName){
    return new Instance(_modelName);
};