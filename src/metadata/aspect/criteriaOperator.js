const { matchType } = require("../../libs/type");
const { markAsCriteriaOperator } = require("../../utils/criteriaOperator.util");
const isPrimitive = require("../../utils/isPrimitive");


module.exports = {
    equal,
    is,
    isTypeOf,
}

function isTypeOf(_type) {

    function checkType(_instance) {
        

        return matchType(_type, _instance);
    }

    markAsCriteriaOperator(checkType);
    return checkType;
}

/**
 * 
 * @param {any} _func 
 * @returns 
 */
function equal(_value) {

    function equalOp(_target) {
        

        return _target === _value;
    }

    markAsCriteriaOperator(equalOp);
    return equalOp;
}

/**
 * @param {any}
 * @returns 
 */
function is(_type) {

    function typeofOp(_value) {
        

        if (isPrimitive(_type)) {

            return equal(_type)(_value);
        }

        return matchType(_type, _value);
    }

    markAsCriteriaOperator(typeofOp);
    return typeofOp;
}