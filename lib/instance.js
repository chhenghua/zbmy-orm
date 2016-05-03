/**
 * Created by YY on 2016/4/18.
 */
var handler = require("./handler");
function Instance(_modelName){
    this.modelName = _modelName;
}

Instance.prototype = {
    findAll: function(){
        handler.HandlerFactory(this.modelName, 'findAll', arguments);
    },
    findOrCreate: function(){
        handler.HandlerFactory(this.modelName, 'findOrCreate', arguments);
    },
    findOrCountAll: function(){
        handler.HandlerFactory(this.modelName, 'findOrCountAll', arguments);
    },
    count: function(){
        handler.HandlerFactory(this.modelName, 'count', arguments);
    },
    max: function(){
        handler.HandlerFactory(this.modelName, 'max', arguments);
    },
    min: function(){
        handler.HandlerFactory(this.modelName, 'min', arguments);
    },
    sum: function(){
        handler.HandlerFactory(this.modelName, 'sum', arguments);
    },
    create: function(){
        handler.HandlerFactory(this.modelName, 'create', arguments);
    },
    update: function(){
        handler.HandlerFactory(this.modelName, 'update', arguments);
    },
    remove: function(){
        handler.HandlerFactory(this.modelName, 'remove', arguments);
    },
    increment: function(){
        handler.HandlerFactory(this.modelName, 'increment', arguments);
    },
    decrement: function(){
        handler.HandlerFactory(this.modelName, 'decrement', arguments);
    },
    bulkCreate: function(){
        handler.HandlerFactory(this.modelName, 'bulkCreate', arguments);
    },
    transaction: function(){
        handler.HandlerFactory(this.modelName, 'transaction', arguments);
    },
    invokeSQL: function(){
        handler.HandlerFactory(this.modelName, 'invokeSQL', arguments);
    },
    w_findAll: function(){
        handler.HandlerFactory(this.modelName, 'w_findAll', arguments);
    },
    w_findOrCountAll: function(){
        handler.HandlerFactory(this.modelName, 'w_findOrCountAll', arguments);
    },
    w_count: function(){
        handler.HandlerFactory(this.modelName, 'w_count', arguments);
    },
    w_max: function(){
        handler.HandlerFactory(this.modelName, 'w_max', arguments);
    },
    w_min: function(){
        handler.HandlerFactory(this.modelName, 'w_min', arguments);
    },
    w_sum: function(){
        handler.HandlerFactory(this.modelName, 'w_sum', arguments);
    }
};

module.exports = function(_modelName){
    return new Instance(_modelName);
};