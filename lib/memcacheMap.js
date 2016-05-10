/**
 * Created by wanggejun on 16/5/6.
 */

var _ = require('lodash');


//错误处理
function handleErr(err) {
    if (err) throw new Error(err);
}

//获取函数名称
function getFunctionName(fn) {
    if (fn.name) {
        return fn.name;
    }
    return (fn.toString().trim().match(/^function\s*([^\s(]+)/) || [])[1];
}


/**
 * check the parameters with already defined model return primaryKey
 * @param {String}   modelName
 * @example modelName = 'user';
 * @param {Object} model    already defined model
 * @example model = {
 *     name: {
 *          type: String,
 *          required: true,
 *          primaryKey: true
 *     },
 *     age: {
 *          type: Number,
 *          required: false
 *     }
 * };
 * @param {Object} parameters   handle afferent parameters
 * @example parameters = {name: 'zbmy', age: 2};
 * @name checkModel
 */



// 构造函数, 校验参数, 返回主键
var checkModel = function(modelName, model, parameters) {

    // 主键
    var primaryKey;
    // value
    var values = {};
    // 确定主键的唯一
    var flag = true;

    if (_.isEmpty(parameters)) {
        return handleErr('parameters can not be empty');
    }

    // 参数的key集合
    var pKeys = Object.keys(parameters);
    // schema的key集合
    var mKeys = Object.keys(model);

    for (var i=0; i<pKeys.length; ++i) {
        // 获取参数的每个key name/age        parameters[pKey] = 'zbmy'
        var pKey = pKeys[i];
        for (var j=0; j<mKeys.length; ++j) {
            // 获取模型的的每个key name/age      model[mKey] = {type: String, required: true, primaryKey: true}
            var mKey = mKeys[j];

            // 校验模型类型
            if (model[mKey].type == undefined || model[mKey].type == null) return handleErr('you must define correct model parameter type');

            if (pKey == mKey) {
                // 校验参数是否为空
                if (model[mKey].required && (typeof parameters[pKey] == null || typeof parameters[pKey] == undefined)) {
                    return handleErr('parameters ' + pKey + ' is required');
                }
                // 校验参数数据类型
                if (!_.isEmpty(model[mKey].type) && getFunctionName(model[mKey].type).toLowerCase() !== typeof parameters[pKey]) {
                    return handleErr('parameters ' + pKey + ' type error');
                }
                // 校验是否为主键
                if (model[mKey].primaryKey) {
                    if (flag) {
                        primaryKey = modelName + '_' + pKey + '_' + parameters[pKey];
                        flag = false;
                    } else {
                        return handleErr('model primary key must be unique');
                    }
                }
                values[pKey] = parameters[pKey];
            }
        }
    }

    if (flag) return handleErr('model must have a parameter be primary key');

    this.primaryKey = primaryKey;
    this.values = values;
};


API = {
    //序列化
    serialization: function(modelName, model, parameters) {
        var modelMap = new checkModel(modelName, model, parameters);
        var primaryKey = modelMap['primaryKey'];
        var values = modelMap['values'];
        return {
            key: primaryKey,
            value: JSON.stringify(values)
        };
    },
    //反序列化
    deserialization: function(entity) {
        if (entity == null || entity == undefined) return {};
        else {
            var obj = JSON.parse(entity);
            return obj;
        }
    }
};

module.exports = API;

