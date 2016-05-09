"use strict"
var Sequelize = require('sequelize');

module.exports = function(sequelize){
    var Company = sequelize.define('company',{
        _id: {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV1
        },
        openid: {
            type: Sequelize.STRING
        }
    },{
        freezeTableName: true,
        timestamps: false,
        paranoid: true,
        underscored: true
    });
    return Company;
}