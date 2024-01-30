const { property_metadata_t, function_metadata_t, function_variant_param_node_metadata_t, parameter_metadata_t } = require("../reflection/metadata");
const { pseudo_parameter_decorator_context_t } = require("../utils/pseudoDecorator");

module.exports = {
    initOverloadedPropeMeta,
    traceMethodVariant,
    locateTrieParameterType
}

/**
 * 
 * @param {property_metadata_t} targetPropMeta 
 */
function initOverloadedPropeMeta(targetPropMeta) {

    const funcMeta = targetPropMeta.functionMeta;
    
    if (typeof funcMeta.variantTrie !== 'object') {

        return;
    }

    funcMeta.lastTrieNode = funcMeta.variantTrie = new function_variant_param_node_metadata_t();
    funcMeta.lastTrieNode.depth = 0;
}

/**
 * 
 * @param {parameter_metadata_t} paramMeta 
 * @param {function_metadata_t} funcMeta 
 */
function addTrieNode(paramMeta, funcMeta) {
    
    const {lastTrieNode} = funcMeta;
    const paramType = paramMeta;


}

/**
 * 
 * @param {function_metadata_t} funcMeta 
 * @param {Array<any>} args 
 */
function traceMethodVariant(funcMeta, args) {


}

/**
 * 
 * @param {Array<parameter_metadata_t>} paramList 
 */
function lookupVariant(paramList = []) {


}

/**
 * 
 * @param {parameter_metadata_t} paramMeta 
 * @param {function_metadata_t} funcMeta
 */
function locateNewVariantTrieNode(paramMeta, funcMeta) {

    const {index, type, allowNull} = paramMeta;
    const {variantTrie} = funcMeta;

    const targetMethodPropMeta = paramMeta.owner.owner;

    initOverloadedPropeMeta()

    let i = 0;
    let currentTrieNode = variantTrie;

    while (true) {

        if (currentTrieNode.depth === index) {

            currentTrieNode.
        }
    }
}

/**
 * 
 * @param {parameter_metadata_t} paramMeta 
 * @param {function_metadata_t} funcMeta
 */
function lookupParam(paramMeta, funcMeta) {

    const {index, type, allowNull} = paramMeta;
    const {variantTrie} = funcMeta;

    let deep = 0;

    while (
        deep <= paramMeta.index &&
        variantTrie.next.size != 0
    ) {
        
        if (deep === paramMeta.index) {

            
        }

        ++deep;
    }
}