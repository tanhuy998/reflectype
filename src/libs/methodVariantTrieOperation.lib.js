const MetadataAspect = require("../metadata/aspect/metadataAspect");
const { property_metadata_t, function_metadata_t, function_variant_param_node_metadata_t, parameter_metadata_t, function_variant_param_node_endpoint_metadata_t } = require("../reflection/metadata");
const Any = require("../type/any");
const { DECORATED_VALUE } = require("./constant");
const { getMetadataFootPrintByKey } = require("./footPrint");
const { OVERLOAD_APPLIED, OVERLOAD_TARGET, OVERRIDE_APPLIED } = require("./methodOverloading/constant");
const { isObjectLike } = require("./type");
const {getAllParametersMeta} = require('./functionParam.lib');

module.exports = {
    locateNewFuncVariantTrieNode,
    //initOverloadedMethodPropeMeta,
    searchForMethodVariant,
    hasVariant,
    mergeFuncVariant,
}

/**
 * 
 * @param {function_variant_param_node_metadata_t} rootTrieNode
 * @param {Array<any>} list 
 * @param {Function} transform 
 */
function searchForMethodVariant(rootTrieNode, list, transform) {

    const iterator = (list || [])[Symbol.iterator]();
    let iteration = iterator.next();
    let currentNode = rootTrieNode;
    console.log('======================================')
    while (
        !iteration.done
    ) {

        const _type = typeof transform === 'function' ? transform(iteration.value) : iteration.value;
        console.log(_type, currentNode)
        if (!currentNode.current.has(_type)) {

            return undefined;
        }

        currentNode = currentNode.current.get(_type);
        iteration = iterator.next();
    }

    return currentNode?.endpoint;
}

/**
 * 
 * @param {function_metadata_t} funcMeta 
 * @param {Array<parameter_metadata_t>} paramTypeList 
 * @returns 
 */
function hasVariant(rootTrieNode, paramTypeList) {

    return typeof searchForMethodVariant(
        rootTrieNode, paramTypeList, 
        (paramMeta) => {
            return paramMeta.type;
        }
    ) === function_variant_param_node_endpoint_metadata_t;
}

/**
 * 
 * @param {Array<parameter_metadata_t>} paramMetaList 
 * @param {function_metadata_t} rootTrieNode 
 * 
 * @returns {function_variant_param_node_metadata_t}
 */
function mergeFuncVariant(paramMetaList, rootTrieNode) {

    if (hasVariant(rootTrieNode, paramMetaList)) {

        throw new Error(); // will be a custom error
    }

    let ret;

    for (const paramMeta of paramMetaList || []) {

        ret = locateNewFuncVariantTrieNode(paramMeta, rootTrieNode);
    }

    return ret;
}

/**
 * 
 * @param {parameter_metadata_t?} paramMeta 
 * @param {function_variant_param_node_metadata_t} hostTrieNode 
 * 
 * @returns {function_variant_param_node_metadata_t}
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
    console.log([3], hostTrieNode)
    return newHostTrieNode;
}

/**
 * Is called when a parameter is type hinted
 * 
 * @param {parameter_metadata_t} paramMeta 
 * @param {function_variant_param_node_metadata_t} rootTrieNode
 */
function locateNewFuncVariantTrieNode(paramMeta, rootTrieNode) {

    const paramIndex = paramMeta.index;
    const hostFuncMeta = paramMeta.owner; 
    let currentHostTrieNode = rootTrieNode;
    console.log('-----------------' , hostFuncMeta.name, paramMeta.index, paramMeta.type ,'---------------------')
    while (true) {
        console.log(['depth'], currentHostTrieNode.depth)
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

    return currentHostTrieNode;
    //console.log(hostFuncMeta.variantTrie)
}