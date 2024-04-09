const { function_metadata_t, function_variant_cache_node_endpoint_metadata_t, function_variant_param_node_endpoint_metadata_t } = require("../../reflection/metadata");
const { searchForMatchTrieNode, _mergeTrieBranch } = require("./methodVariantTrieOperation.lib");
const { FUNC_CACHE, FUNC_TRIE } = require("./registry/function.reg");
const { getTypeForFunctionDispatch } = require("./util.lib");

module.exports = {
    lookupArgBranch,
    mergeArgBranch,
}

/**
 * 
 * @param {function_metadata_t} genericFuncMeta 
 * @param {Iterable<any>} args
 * 
 * @returns {function_metadata_t?}
 */
function lookupArgBranch(genericFuncMeta, args = []) {
    
    const node = searchForMatchTrieNode(FUNC_TRIE, args, val => getTypeForFunctionDispatch(val));

    return typeof node !== 'object' ||
    typeof node.endpoint !== 'object' ? undefined : node.endpoint.dispatchTable.get(genericFuncMeta);
}

/**
 * 
 * @param {function_metadata_t} genericFuncMeta 
 * @param {Iterable<any>} args 
 */
function mergeArgBranch(genericFuncMeta, genericImplementation, args = []) {
    
    const node = _mergeTrieBranch(FUNC_TRIE, args, val => getTypeForFunctionDispatch(val));
    node.endpoint ??= new function_variant_param_node_endpoint_metadata_t();

    if (node.endpoint.dispatchTable.has(genericFuncMeta)) {

        return;
    }

    node.endpoint.dispatchTable.set(genericFuncMeta, genericImplementation);
}