const config = require('../../../config.json');
/**
 * The counter is just a padding value for Date.now(),
 * Date.now() returns current time in ms therefore a sequence 
 * of multiple pseudo methods would be assigned the same Date.now() value.
 * Padding value is neccessary.
 */
let counter = 0;

module.exports = {
    METHOD,
    OVERLOAD_TARGET: '_overload_target',
    OVERLOAD_APPLIED: '_isOverloadMethod',
    OVERLOAD_PENDING: '_overload_pending',
    OVERRIDE_APPLIED: '_isOverrideMethod',
    LAST_TRIE_NODE: '_last_trie_node',
    PSEUDO_OVERLOADED_METHOD_NAME: '_pseudo_overloaed_method_name',
    MULTIPLE_DISPATCH: Symbol('multiple_dispatch'),
    ESTIMATION_MASS: Symbol('_estimation_mass'),
    OVERRIDE: '_is_override_method'
}


function METHOD(overloadMethodName) {

    const description = `pseudoMethod$${overloadMethodName}-${Date.now() + counter++}`;

    return config.reflectypeOfficialDecorator ? Symbol(description) : description;
}