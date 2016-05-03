/**
 * Created by YY on 2016/4/18.
 */
var mongoose    = require("mongoose");
var path        = require("path");
var fs          = require("fs");

module.exports = function(_config){

    /*
     * Mongo初始化
     */
    var db      = {}
    ,models     = {}
    ,modelPath  = _config.modelPath
    ,mongoHost  = _config.mongoHost
    ,mongoName = _config.mongoName
    ,userName   = _config.userName
    ,password   = _config.password
    ,scriptExt  = _config.scriptExt;


    mongoose.connect("mongodb://"+mongoHost+"/"+mongoName);
    db = mongoose.connection;
    db.on('error',console.error.bind(console,'连接错误:'));
    db.once('open',function(){
       console.log("mongodb init success.");
    });
    fs.readdirSync(modelPath)
    .filter(function(file){
        return file.indexOf(scriptExt) == (file.length-scriptExt.length) && true == true
    }).forEach(function(file){
        try{
            var model = require(path.join(modelPath, file));
            model.dialect = "mongo";
            models[model.modelName] = model;
        }catch(e){
            console.log(e);
        }
    });
    return models;
    //});
};