const MetadataAspect = require("../../metadata/aspect/metadataAspect");
const { property_metadata_t, function_metadata_t, function_variant_param_node_metadata_t, parameter_metadata_t, function_variant_param_node_endpoint_metadata_t, metaOf, method_variant_mapping_table_metadata_t } = require("../../reflection/metadata");
const Any = require("../../type/any");
const { DECORATED_VALUE } = require("../constant");
const { getMetadataFootPrintByKey } = require("../footPrint");
const { OVERLOAD_APPLIED, OVERLOAD_TARGET, OVERRIDE_APPLIED } = require("./constant");
const { isObjectLike, isValuable, isObject } = require("../type");
const {getAllParametersMeta} = require('../functionParam.lib');
const { addStatisticalPieace } = require("./methodArgsEstimation.lib");

module.exports = {
    searchForMethodVariant,
    hasVariant,
    mergeFuncVariant,
    retrieveAllSignatures,
    hasTrie,
    retrieveTrie,
    retrieveSignatureMatrix
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

    // const iterator = (list || [])[Symbol.iterator]();
    // let iteration = iterator.next();
    // let currentNode = rootTrieNode;
    // //console.log('======================================')
    // while (
    //     !iteration.done
    // ) {

    //     const _type = typeof transform === 'function' ? transform(iteration.value) : iteration.value;
    //     //console.log(_type, currentNode)
    //     if (!currentNode.current.has(_type)) {

    //         return undefined;
    //     }

    //     currentNode = currentNode.current.get(_type);
    //     iteration = iterator.next();
    // }

    // return currentNode?.endpoint;

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
 * @param {function_metadata_t} indexFuncMeta
 * @param {function_metadata_t} targetFuncMeta
 * 
 * @returns {function_variant_param_node_metadata_t}
 */
function mergeFuncVariant(
  paramMetaList,
  rootTrieNode,
  statisticTables,
) {

    if (hasVariant(rootTrieNode, paramMetaList)) {

        throw new Error(); // will be a custom error
    }

    /**@type {function_variant_param_node_metadata_t} */
    let ret = rootTrieNode;

    for (const paramMeta of paramMetaList || []) {

        ret = insertTrieNode(ret, paramMeta, statisticTables);
    }

    ret.endpoint ??= new function_variant_param_node_endpoint_metadata_t();
    ret.endpoint.depth = ret.depth;

    return ret;
}

/**
 * Insert a node next to the given node, this is unsafe function and is not exposed
 * outside the module.
 * 
 * @param {function_variant_param_node_metadata_t} currentNode 
 * @param {parameter_metadata_t?} paraMeta 
 * @param {?Array<Map<Function, number>>} statisticTables
 * 
 */
function insertTrieNode(currentNode, paraMeta, statisticTables = []) {

    const _type = paraMeta?.type || Any;

    addStatisticalPieace(paraMeta, currentNode, statisticTables);

    if (currentNode.current.has(_type)) {

        return currentNode.current.get(_type);
    }

    const nextNode = new function_variant_param_node_metadata_t(currentNode);
    currentNode.current.set(_type, nextNode);

    return nextNode;

    // const _type = paraMeta?.type || Any;
    // const current = currentNode.current;

    // return current.has(_type) ? current.get(_type) 
    //         : current.set(_type, new function_variant_param_node_metadata_t(currentNode))
    //                 .get(_type);
}


// /**
//  * @param {Function} _class
//  * @param {property_metadata_t} propMeta 
//  * @param {Array<Function>} paramTypeList
//  */
// function findMethodVariantOf(_class, propMeta, paramTypeList) {

//     if (!propMeta.isMethod) {

//         return undefined;
//     }

//     const typeMeta = propMeta.owner.typeMeta;
    
//     if (
//         _class !== typeMeta.abstract &&
//         !(_class.prototype instanceof typeMeta.abstract)
//     ) {

//         throw new ReferenceError(`could find method variant of a class [${_class.name}] that is not derived class of the target propMeta's origin that is [${typeMeta.abstract.name}]`);
//     }

//     const methodVariantMaps = typeMeta.methodVariantMaps;
//     const methodName = propMeta.name;
//     const variantMap = propMeta.static ? methodVariantMaps.static : methodVariantMaps._prototype;
//     const trieEndpoint = searchForMethodVariant(variantMap.mappingTable.get(methodName), paramTypeList);

//     if (!(trieEndpoint instanceof function_variant_param_node_endpoint_metadata_t)) {

//         return undefined;
//     }

//     switch(trieEndpoint.vTable.size) {
//         case 0:
//             return undefined;
//         case 1:
//             /**
//              * When size of trieEndpoint's map is 1,
//              * this means there are no conflict between base class 
//              * and derived classes (overriding behavior).
//              */
//             return trieEndpoint.vTable.values().next().value;
//         default:
//             break;
//     }

//     let tempTargetClass = _class;

//     while (
//         Object.getPrototypeOf(tempTargetClass) !== Object.getPrototypeOf(Function)
//     ) {

//         const tempClassTypeMeta = metaOf(_class);

//         if (
//             isObject(tempClassTypeMeta) &&
//             trieEndpoint.vTable.has(tempClassTypeMeta)
//         ) {

//             return trieEndpoint.vTable.get(tempClassTypeMeta);
//         }

//         tempTargetClass = Object.getPrototypeOf(tempTargetClass);
//         continue;
//     }
// }

/**
 * 
 * @param {function_variant_param_node_metadata_t} rootTrieNode 
 * 
 * @returns {Array<Array<Function>>}
 */
function retrieveAllSignatures(rootTrieNode) {

    let ret = [];
    
    for (const [_type, nextDepth] of rootTrieNode.current.entries() || []) {
        
        traverse(nextDepth, [_type], ret, {toObject: true});
    }
    
    return ret;
}

function retrieveSignatureMatrix(rootTrieNode) {

    let ret;

    for (const [_type, nextDepth] of rootTrieNode.current.entries() || []) {
        
        traverse(nextDepth, [_type], ret, {toObject: false});
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