const METHOD = new Proxy({}, {
    get(target, name) {

        if (name !== Symbol.toStringTag) {

            throw new Error('invalid use of METHOD');
        }

        return Date.now();
    }
})

module.exports = {
    METHOD,
    OVERLOAD_TARGET: '_overload_target',
    OVERLOAD_APPLIED: '_isOverloadMethod',
    OVERLOAD_PENDING: '_overload_pending',
    OVERRIDE_APPLIED: '_isOverrideMethod',
    LAST_TRIE_NODE: '_last_trie_node'
}