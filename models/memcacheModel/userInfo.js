/**
 * Created by wanggejun on 16/5/5.
 */

'use strict';

module.exports = {
    modelName: 'userInfo',
    model: {
        name: {
            type: String,
            required: true,
            primaryKey: true
        },
        age: {
            type: Number,
            required: false
        }
    }
};