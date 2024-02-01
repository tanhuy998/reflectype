const { property_metadata_t, function_metadata_t, function_variant_param_node_metadata_t, parameter_metadata_t } = require("../reflection/metadata");
const Any = require("../type/any");
const { pseudo_parameter_decorator_context_t } = require("../utils/pseudoDecorator");
const { getMetadataFootPrintByKey, setMetadataFootPrint, metadataHasFootPrint } = require("./footPrint");
const { getParamMetaByIndex } = require("./functionParam.lib");
const { currentPropMeta } = require("./metadata/metadataTrace");
const { LAST_TRIE_NODE } = require("./methodOverloading/constant");
const { isValuable } = require("./type");

module.exports = {
    locateNewFuncVariantTrieNode,
    initOverloadedMethodPropeMeta,
    searchForMethodVariant,
    mergeFuncVariant
}

/**
 * Init if the target method function_metadata_t has not been 
 * applied any param meta. 
 * 
 * @param {function_metadata_t} targetPropMeta 
 */
function initOverloadedMethodPropeMeta(targetFuncMeta) {
    
    if (
        //!metadataHasFootPrint(targetFuncMeta, LAST_TRIE_NODE) ||
        typeof targetFuncMeta.variantTrie === 'object'
    ) {

        return;
    }

    const rootTrieNode = new function_variant_param_node_metadata_t();
    rootTrieNode.depth = 0;
    targetFuncMeta.variantTrie = rootTrieNode;
    setMetadataFootPrint(targetFuncMeta, LAST_TRIE_NODE, rootTrieNode);
}


/**
 * Locate the host function meta (of the oveloaded method) 
 * last manipulated trie node
 * 
 * @param {parameter_metadata_t} paramMeta 
 * @param {function_metadata_t} hostFuncMeta
 * 
 * @returns {function_variant_param_node_metadata_t}
 */
function locateBaseHostTrieNodeForParamMeta(paramMeta, hostFuncMeta) {

    if (!hostFuncMeta) {

        return undefined;
    }

    const paramPropMeta = paramMeta.owner.owner;
    initOverloadedMethodPropeMeta(hostFuncMeta)

    // return currentPropMeta() === paramPropMeta ? 
    //         getMetadataFootPrintByKey(hostFuncMeta, LAST_TRIE_NODE) 
    //         : hostFuncMeta.variantTrie;

    let currentTrieNode = hostFuncMeta.variantTrie;

    while (true) {

        if (
            currentTrieNode.depth === paramMeta.index
        ) {

            return currentTrieNode;
        }

        if (
            currentTrieNode.depth < paramMeta.index &&
            (currentTrieNode.current.size === 0 || !currentTrieNode.current.has(paramMeta.type))
        ) {

            return currentTrieNode;            
        }

        currentTrieNode = currentTrieNode.current.get(paramMeta.type);
    }
}

/**
 * Is called when a parameter is type hinted
 * 
 * @param {parameter_metadata_t} paramMeta 
 */
function locateNewFuncVariantTrieNode(paramMeta) {

    const paramIndex = paramMeta.index;
    const hostFuncMeta = paramMeta.owner; 
    let currentHostTrieNode = locateBaseHostTrieNodeForParamMeta(paramMeta, hostFuncMeta);
    //console.log('-----------------' , hostFuncMeta.name, paramMeta.index, paramMeta.type ,'---------------------')
    while (true) {
        console.log(1)
        if (currentHostTrieNode.depth === paramIndex) {

            manipulateNewTrieNode(paramMeta, currentHostTrieNode);
            break;
        }
        console.log(2)
        if (currentHostTrieNode.depth < paramIndex) {

            currentHostTrieNode = manipulateNewTrieNode(null, currentHostTrieNode);
            continue;
        }
        console.log(3)
        if (currentHostTrieNode.depth >= paramIndex) {

            currentHostTrieNode = manipulateNewTrieNode(paramMeta, currentHostTrieNode);
            continue;
        }
    }

    //console.log(hostFuncMeta.variantTrie)
}

/**
 * 
 * @param {parameter_metadata_t?} paramMeta 
 * @param {function_variant_param_node_metadata_t} hostTrieNode 
 */
function manipulateNewTrieNode(paramMeta, hostTrieNode) {

    const paramType = paramMeta?.type ?? Any;

    if (
        hostTrieNode.current.has(paramType) &&
        paramType !== Any
    ) {

        throw new ReferenceError();
    }
    else if (
        hostTrieNode.current.has(paramType) &&
        paramType === Any
    ) { 
        /**
         * when there is no type and the current depth also
         * 
         */
        return hostTrieNode.current.get(paramType);
    }

    const newHostTrieNode = new function_variant_param_node_metadata_t(hostTrieNode);
    hostTrieNode.current.set(paramType, newHostTrieNode);

    return newHostTrieNode;
}

/**
 * 
 * @param {Array<parameter_metadata_t>} paramMetaList 
 * @param {function_metadata_t} funcMeta 
 */
function mergeFuncVariant(paramMetaList, funcMeta) {

    if (hasVariant(funcMeta, paramTypeList)) {

        throw new Error(); // will be a custom error
    }

    for (const paramMeta of paramMetaList || []) {

        locateNewFuncVariantTrieNode(paramMeta, funcMeta);
    }
}

/**
 * 
 * @param {function_metadata_t} funcMeta 
 * @param {Array<parameter_metadata_t>} paramTypeList 
 * @returns 
 */
function hasVariant(funcMeta, paramTypeList) {

    return typeof searchForMethodVariant(
        funcMeta, paramTypeList, 
        (paramMeta) => {
            return paramMeta.type;
        }
    ) === function_metadata_t;
}

/**
 * 
 * @param {function_metadata_t} funcMeta
 * @param {Array<any>} list 
 * @param {Function} transform 
 */
function searchForMethodVariant(funcMeta, list, transform) {

    const iterator = (list || [])[Symbol.iterator]();
    const iteration = iterator.next();
    let currentNode = funcMeta.variantTrie;

    while (
        !iteration.done
    ) {

        const _type = typeof transform === 'function' ? transform(iteration.value) : iteration.value;

        if (!currentNode.current.has(_type)) {

            throw new Error() // will be a custom error;
        }

        const paramIndex = currentNode.depth;
        const paramMeta = getParamMetaByIndex(funcMeta, paramIndex);

        currentNode = currentNode.current.get(_type);
        iteration = iterator.next();
    }
}