const { 
    property_metadata_t, 
    function_metadata_t, 
    function_variant_param_node_metadata_t, 
    parameter_metadata_t, 
    function_variant_param_node_endpoint_metadata_t, 
    metaOf, 
    method_variant_mapping_table_metadata_t, 
    function_variant_cache_node_endpoint_metadata_t
} = require("../../reflection/metadata");
const Any = require("../../type/any");
const { addStatisticalPieace } = require("./methodArgsEstimation.lib");

module.exports = {
    searchForMethodVariant,
    hasVariant,
    mergeFuncVariant,
    retrieveAllSignatures,
    hasTrie,
    retrieveTrie,
    retrieveSignatureMatrix,
    searchForMatchTrieNode,
    _mergeTrieBranch
}

/**
 * 
 * @param {property_metadata_t} propMeta 
 */
function hasTrie(propMeta) {

    return retrieveVariantMap(propMeta)?.has(propMeta.name);
}

/**
 * 
 * @param {property_metadata_t} propMeta 
 * 
 * @returns {method_variant_mapping_table_metadata_t}
 */
function retrieveVariantMap(propMeta) {

    const typeMeta = propMeta.owner.typeMeta;
    const variantMaps = typeMeta.methodVariantMaps;
    return propMeta.static ? variantMaps.static : variantMaps._prototype;
}

/**
 * 
 * @param {property_metadata_t} propMeta 
 * 
 * @returns {function_variant_param_node_metadata_t}
 */
function retrieveTrie(propMeta) {

    return retrieveVariantMap(propMeta)?.mappingTable?.get(propMeta.name);
}

/**
 * 
 * @param {function_variant_param_node_metadata_t} rootTrieNode
 * @param {Array<any>} list 
 * @param {Function} transform 
 */
function searchForMatchTrieNode(rootTrieNode, list, transform) {

    const iterator = (list || [])[Symbol.iterator]();
    let iteration = iterator.next();
    let currentNode = rootTrieNode;

    while (
        !iteration.done
    ) {

        const _type = typeof transform === 'function' ? transform(iteration.value) : iteration.value;

        if (!currentNode.current.has(_type)) {

            return undefined;
        }

        currentNode = currentNode.current.get(_type);
        iteration = iterator.next();
    }

    return currentNode;
}

/**
 * 
 * @param {function_variant_param_node_metadata_t} rootTrieNode
 * @param {Array<any>} list 
 * @param {Function} transform 
 */
function searchForMethodVariant(rootTrieNode, list, transform) {

    return searchForMatchTrieNode(rootTrieNode, list, transform)?.endpoint;
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
            return paramMeta?.type || Any;
        }
    ) === function_variant_param_node_endpoint_metadata_t;
}

/**
 * 
 * @param {Array<parameter_metadata_t>} paramMetaList 
 * @param {function_metadata_t} rootTrieNode 
 * @param {?Array<Map<Function, number>>} statisticTables
 * 
 * @returns {function_variant_param_node_metadata_t}
 */
function mergeFuncVariant(paramMetaList, rootTrieNode, statisticTables) {

    if (hasVariant(rootTrieNode, paramMetaList)) {

        throw new Error(); // will be a custom error
    }

    // /**@type {function_variant_param_node_metadata_t} */
    // let ret = rootTrieNode;

    // for (const paramMeta of paramMetaList || []) {

    //     ret = insertTrieNode(ret, paramMeta, statisticTables);
    // }

    const ret = _mergeTrieBranch(
        rootTrieNode, 
        paramMetaList.map(meta => meta?.type || Any),
        statisticTables
    )

    ret.endpoint ??= new function_variant_param_node_endpoint_metadata_t();
    ret.endpoint.depth = ret.depth;
    ret.cache ??= new function_variant_cache_node_endpoint_metadata_t();

    manipulateStatisticTable(paramMetaList, statisticTables);

    return ret;
}


function manipulateStatisticTable(paramMetaList = [], statisticTables) {

    for (let depth = 0; depth < paramMetaList.length; ++depth) {

        const meta = paramMetaList[depth];
        addStatisticalPieace(meta, depth, statisticTables);
    }
}

/**
 * 
 * @param {function_variant_param_node_endpoint_metadata_t} node 
 * @param {Iterable} list 
 * @param {function} transform
 * @returns 
 */
function _mergeTrieBranch(node, list, transform) {

    /**@type {function_variant_param_node_metadata_t} */
    let ret = node;
    const hasTransform = typeof transform === 'function';

    for (const val of list || []) {

        ret = insertTrieNode(ret, hasTransform ? transform(val) : val);
    }

    return ret;
}

/**
 * Insert a node next to the given node, this is unsafe function and is not exposed
 * outside the module.
 * 
 * @param {function_variant_param_node_metadata_t} currentNode insertTrieNode
 * @param {parameter_metadata_t?} paraMeta 
 * @param {?Array<Map<Function, number>>} statisticTables
 * 
 */
function insertTrieNode(currentNode, key) {

    const current = currentNode.current;

    if (current.has(key)) {

        return current.get(key);
    }

    const nextNode = new function_variant_param_node_metadata_t(currentNode);
    current.set(key, nextNode);

    return nextNode;
}

/**
 * 
 * @param {function_variant_param_node_metadata_t} rootTrieNode 
 * 
 * @returns {Array<Array<Function>>}
 */
function retrieveAllSignatures(rootTrieNode) {

    let ret = [];

    for (const [_type, nextDepth] of rootTrieNode.current.entries() || []) {

        traverse(nextDepth, [_type], ret, { toObject: true });
    }

    return ret;
}

function retrieveSignatureMatrix(rootTrieNode) {

    let ret;

    for (const [_type, nextDepth] of rootTrieNode.current.entries() || []) {

        traverse(nextDepth, [_type], ret, { toObject: false });
    }

    return ret;
}

/**
 * 
 * @param {function_variant_param_node_metadata_t} trieNode 
 * @param {Array<Function>} stack
 * 
 * @returns {Array<Array<Function>>}
 */
function traverse(trieNode, stack = [], globalList = [], options = {}) {
    /**
     * traverse from low to hight depth.
     * if catch endpoint on a node, the entire stack is a variant signature.
     */
    if (trieNode.endpoint) {

        const dataToPush = options.toObject ? {
            endpoint: trieNode.endpoint,
            paramTypes: [...stack]
        } : [...stack];

        globalList.push(dataToPush);
    }

    const recoverPoint = stack.length;

    for (const [_type, nextDepth] of trieNode.current.entries() || []) {

        stack.push(_type);
        traverse(nextDepth, stack, globalList, options);

        while (
            stack.length !== recoverPoint &&
            stack.length !== 0
        ) {

            stack.pop();
        }
    }
}