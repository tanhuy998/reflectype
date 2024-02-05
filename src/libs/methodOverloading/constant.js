const config = require('../../../config.json');

module.exports = {
    METHOD,
    OVERLOAD_TARGET: '_overload_target',
    OVERLOAD_APPLIED: '_isOverloadMethod',
    OVERLOAD_PENDING: '_overload_pending',
    OVERRIDE_APPLIED: '_isOverrideMethod',
    LAST_TRIE_NODE: '_last_trie_node',
    PSEUDO_OVERLOADED_METHOD_NAME: '_pseudo_overloaed_method_name',
}


function METHOD(overloadMethodName) {

    const description = `pseudoMethod$${overloadMethodName}-${Date.now()}`;

    return config.reflectypeOfficialDecorator ? Symbol(description) : description;
}