/**
 * Created by YY on 2016/4/21.
 */
var mongoose = require("mongoose");

module.exports = mongoose.model(
    'user',
    new mongoose.Schema({
        name: String,
        openId: String,
        age: Number
    })
);