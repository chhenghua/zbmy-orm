/**
 * Created by wanggejun on 16/5/4.
 */

var memcached = require("node_memcached");



module.exports = function(_config) {

    /*
     * Memcached初始化
     */
    var db        = {},
        memHost   = _config.host,
        memPort   = _config.port,
        username  = _config.username,
        password  = _config.password;

    var client = memcached.createClient(memPort, memHost, {
        username: username,
        password: password
    });

    client.on("error", function (err) {
        console.log("memcached error: " + err);
    });
    client.once('connect', function() {
        console.log('connect memached success');
    });
    client.on('end', function() {
        console.log('memached is ended');
    });

    client.dialect = "memcache";

    return client;

};