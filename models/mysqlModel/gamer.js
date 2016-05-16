"use strict"
var Sequelize = require('sequelize');

module.exports = function(sequelize){
    var Gamer = sequelize.define('gamer',{
        _id: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV1
        },
        openid: {
            type: Sequelize.STRING
        },
        version: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        }
    },{
        freezeTableName: true,
        timestamps: false,
        paranoid: true,
        underscored: true
    });
    return Gamer;
}