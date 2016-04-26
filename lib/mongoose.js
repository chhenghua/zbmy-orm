/**
 * Created by YY on 2016/4/18.
 */
var mongoose    = require("mongoose");
var fs          = require("fs");

module.exports = function(_config){

    /*
     * Mongo初始化
     */
    var    db  = {},
        models = {},
     modelPath = _config.modelPath,
     mongoHost = _config.mongoHost,
     mongoName = _config.mongoName,
      userName = _config.userName,
      password = _config.password,
     scriptExt = _config.scriptExt;


    db = mongoose.createConnection(mongoHost, mongoName);
    db.on('error',console.error.bind(console,'连接错误:'));
    db.once('open',function(){
        fs.readdirSync(modelPath)
        .filter(function(file){
            return file.indexOf(scriptExt) == (file.length-scriptExt.length-1) && true == true
        }).forEach(function(file){
            try{
                var model = require(modelPath+""+file);
                model.dialect = "mongo";
                models[model.prototype.modelName] = require(modelPath+""+file);
            }catch(e){
                console.log(e);
            }
        });
    });

    return models;
}