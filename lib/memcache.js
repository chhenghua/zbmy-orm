/**
 * Created by wanggejun on 16/5/4.
 */

var memcached   = require("node_memcached");
var path        = require('path');
var fs          = require('fs');



module.exports = function(_config) {

    /*
     * Memcached初始化
     */
    var db        = {},
        memHost   = _config.host,
        memPort   = _config.port,
        username  = _config.username,
        password  = _config.password,
        models    = {},
        modelPath = _config.modelPath,
        scriptExt  = _config.scriptExt;


    var client = memcached.createClient(memPort, memHost, {
        username: username,
        password: password
    });

    client.on("error", function (err) {
        console.log("memcached error: " + err);
    });
    client.once('connect', function() {
        console.log('connect memcached success');
    });
    client.on('ready', function() {
        client.isReady = true;
        console.log('memcached is ready');
    });
    client.on('end', function() {
        client.isReady = false;
        console.log('memcached is ended');
    });

    fs.readdirSync(modelPath)
        .filter(function(file) {
            return file.indexOf(scriptExt) == (file.length-scriptExt.length) && true == true
        }).forEach(function(file) {
       try {
           var modelObj = require(path.join(modelPath, file));
           var model = modelObj.model;
           var modelName = modelObj.modelName;
           
           models[modelName] = model;
           // client 连接
           models.client = client;
           
           /*
            // model.dialect = 'memcache';
            models[model.modelName] = model;
            // client 连接
            models.client = client;
           * */
           
       } catch(e) {
           console.log(e);
       }
    });
    return models;
};