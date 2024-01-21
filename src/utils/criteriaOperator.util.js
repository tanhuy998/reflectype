const IS_OPERATOR = '__is_criteria_operator';

module.exports = {
    isCriteriaOperator,
    markAsCriteriaOperator
}

/**
 * 
 * @param {Function} _func 
 */
function isCriteriaOperator(_func) {
    
    return typeof _func === 'function' &&
            _func[IS_OPERATOR] === true;
}

/**
 * 
 * @param {Function} _func 
 */
function markAsCriteriaOperator(_func) {

    _func[IS_OPERATOR] = true;
}