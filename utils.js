const Interface = require('./interface');


function countFunctionParams(_func) {

    if (typeof _func !== 'function') return 0;

    const detectParamsRegex = /\((.*)\)/;

    const match = _func.toString()
                        .match(detectParamsRegex);

    if (match == null) return 0;

    paramsString = match[1];

    return paramsString.split(',').length;
}

function preventImmediateValue(_type) {

    if (typeof _type != 'function') {

        throw new TypeError(`Cannot pass immediate value`);
    }
}

function isInterface(_class) {

    return _class.__proto__ === Interface;
} 

module.exports = {preventImmediateValue, isInterface, countFunctionParams}