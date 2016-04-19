/**
 * Created by YY on 2016/4/19.
 */

module.exports = function(_config){
    /*
     * MYSQL初始化
     * sequelize基本参数配置
     */
    var db = {};
    var sequelize = new Sequelize(_config.database, _config.username, _config.password, _config.options);
    /*
     * module自定义参数配置
     * modelPath 数据库映射文件路径
     * modelType 数据库读写类型
     */

    var modelPath = _config.modelPath;
    fs.readdirSync(modelPath)
        .filter(function(file) {
            return (file.indexOf('.') !== 0) && (file !== basename);
        })
        .forEach(function(file) {
            if (file.slice(-7) !== '.coffee') return;
            var model = sequelize['import'](path.join(modelPath, file));
            db[model.name] = model;
        });

    Object.keys(db)
        .forEach(function(modelName) {
            if (db[modelName].associate) {
                db[modelName].associate(db);
            }
        });

    //db.sequelize = sequelize;
    //db.Sequelize = Sequelize;
    return db;
}