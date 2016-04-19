/**
 * Created by YY on 2016/4/15.
 */
'use strict';
var fs          = require('fs');
var path        = require('path');
var Sequelize   = require('sequelize');
var basename    = path.basename(module.filename);
var env         = process.env.NODE_ENV || 'development';
var db          = {};


var Instance = function(_modelName){
    this.model = db[_modelName];
}

Instance.init = function(_config){
    var sequelize = new Sequelize(_config.database, _config.username, _config.password, _config.options);
    var modelPath = _config.modelPath
    fs.readdirSync(modelPath)
        .filter(function(file) {
            return (file.indexOf('.') !== 0) && (file !== basename);
        })
        .forEach(function(file) {
            if (file.slice(-7) !== '.coffee') return;
            var model = sequelize['import'](path.join(modelPath, file));
            db[model.name] = model;
        });

    Object.keys(db).forEach(function(modelName) {
        if (db[modelName].associate) {
            db[modelName].associate(db);
        }
    });

    db.sequelize = sequelize;
    db.Sequelize = Sequelize;
};

Instance.prototype.findOne = function(fields, callback){
    var self = this;
    this.model.findOne(fields).then(function(result) {
        return callback(result.dataValues);
    });
}

module.exports = {
    Instance: Instance,
    Sequelize: Sequelize
}
