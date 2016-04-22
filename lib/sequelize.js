/**
 * Created by YY on 2016/4/19.
 */
var fs        = require('fs')
, path        = require('path')
, Sequelize   = require('sequelize')
, basename    = path.basename(module.filename)
, env         = process.env.NODE_ENV || 'development';
module.exports = function(_config){
    /*
     * MYSQL初始化
     * sequelize基本参数配置
     */
    var db = {}, modelPath = _config.modelPath;
    var sequelize = new Sequelize(_config.database, _config.username, _config.password, _config.options);
    /*
     * module自定义参数配置
     * modelPath 数据库映射文件路径
     */

    fs.readdirSync(modelPath)
        .filter(function(file) {
            return (file.indexOf('.') !== 0) && (file !== basename);
        })
        .forEach(function(file) {
            //if (file.slice(-7) !== '.coffee') return;
            try{
                var model = sequelize.import(path.join(modelPath, file));
                model.dialect = 'mysql';
                db[model.name] = model;
            }catch(e){
                console.log(e);
            }
        });

    Object.keys(db)
        .forEach(function(modelName) {
            if (db[modelName].options.hasOwnProperty('associate')) {
                db[modelName].options.associate(db);
            }
        });

    db.sequelize = sequelize;
    db.Sequelize = Sequelize;
    return db;
}