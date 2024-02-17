const { property_metadata_t, function_variant_param_node_metadata_t, metaOf, function_variant_param_node_endpoint_metadata_t } = require("../../reflection/metadata");
//const { estimateArgType } = require("./methodArgsEstimation.lib.lib");
const { retrieveTrie } = require("./methodVariantTrieOperation.lib");
const { getTypeOf } = require("../type");
const { estimateArgs } = require("./methodArgsEstimation.lib");
const { Interface } = require("../../interface");
const MethodVariantMismatchError = require("./error/methodVariantMismatchError");

module.exports = {
    dispatchMethodVariant,
    diveTrieByArguments,
}

/**
 * 
 * @param {Object|Function|any} binder 
 * @param {property_metadata_t} propMeta 
 * @param {Array<any>} args 
 */
function dispatchMethodVariant(binder, propMeta, args) {

    //console.log(propMeta)

    try {

        const _class = getTypeOf(binder);
        const trieEndpoint = diveTrieByArguments(_class, propMeta, args);        
        return dispatchVtable(binder, trieEndpoint, args);
    }
    catch (e) {

        if (!(e instanceof MethodVariantMismatchError)) {
            
            throw e;
        }

        traceAndHandleMismatchVariant(e);
    }
}

/**
 * 
 * @param {Function|Object} binder 
 * @param {function_variant_param_node_endpoint_metadata_t} trieEndpoint 
 * @param {Array<any>} args 
 */
function dispatchVtable(binder, trieEndpoint, args) {

    let _class = getTypeOf(binder);

    while (
        _class !== Object.getPrototypeOf(Function)
    ) {

        const typeMeta = metaOf(_class);

        if (trieEndpoint.vTable.has(typeMeta)) {

            return trieEndpoint.vTable.get(typeMeta)?.call(binder, ...args);
        }

        _class = Object.getPrototypeOf(_class);
    }
}

/**
 * 
 * @param {MethodVariantMismatchError} e 
 */
function traceAndHandleMismatchVariant(e) {

    console.log(e.estimatedTypes)
}

/**
 * 
 * @param {Function} _class 
 * @param {property_metadata_t} propMeta 
 * @param {Array} args 
 * 
 * @returns {function_variant_param_node_endpoint_metadata_t}
 */
function diveTrieByArguments(_class, propMeta, args) {
    console.time('estimation time');
    const variantMaps = propMeta.owner.typeMeta.methodVariantMaps;
    const targetMap = propMeta.static ? variantMaps?.static : variantMaps._prototype;
    const statisticTable = targetMap.statisticTable;

    if (!statisticTable) {

        return false;
    }

    const estimation = estimateArgs(propMeta, args);
    console.timeEnd('estimation time');
    if (
        !Array.isArray(estimation) ||
        estimation.length === 0
    ) {

        return false;
    }
    console.log('estimation list', estimation)
    console.time('calc')
    const targetTrie = retrieveTrie(propMeta);
    // const iterator = args[Symbol.iterator]();
    // let iteration = iterator.next();
    // let index = 0;
    let iterationNode = targetTrie;
    
    const ret = calculate(targetTrie, estimation)?.endpoint;
    console.timeEnd('calc')

    return ret;
} 

/**
 * 
 * @param {function_variant_param_node_metadata_t} trieNode 
 * @param {Array<Object>} estimations 
 */
function calculate(trieNode, estimations, distance = 0) {
    //console.log(['depth'], trieNode.depth, estimations);
    //console.log(trieNode.current)
    const estimationPiece = estimations[trieNode.depth];

    /**
     * Initial nearest variant,
     * endpoint for the initial nearest is 
     * the method variant whose signature is null
     * if exists.
     */
    let nearest = {
        delta: Infinity,
        endpoint: trieNode.endpoint || undefined
    };

    for (const {type, delta} of estimationPiece || [{}]) {
        
        if (!trieNode.current.has(type)) {
            //console.log(1)
            continue;
        }

        const nextNode = trieNode.current.get(type);
        const d = distance + delta + (type instanceof Interface) ? 0.5 : 0;

        if (nextNode.endpoint) {
            //console.log(2)
            nearest = min(nearest, {
                delta: d,
                endpoint: nextNode.endpoint
            });
        }

        nearest = min(nearest, calculate(
            nextNode, estimations, d
        ));

        //console.log(nearest)
    }

    return nearest;
}

function min(left, right) {

    return left.delta < right.delta ? left : right;
}

// /**
//  * 
//  * @param {Function} _type 
//  * @param {function_variant_param_node_metadata_t} currentNode 
//  * @param {Array<Function>} stack
//  * @param {Array<Array>} map 
//  */
// function diveInheritanceChain(_type, currentNode, stack, map) {

//     const recoverPoint = stack.length;
//     let currentType = _type;

//     while (
//         currentType !== Object.getPrototypeOf(Function)
//     ) {

//         if (currentNode.current.has(currentType)) {

//             const nextNode = currentNode.current.get(currentType);

//             stack.push(currentType);
//             diveInheritanceChain();
//         }

//         currentType = Object.getPrototypeOf(currentType);
//     }

//     /**
//      * recover to the initial state of the stack
//      */
//     while (
//         stack.length !== recoverPoint &&
//         stack.length !== 0
//     ) {

//         stack.pop();
//     }
// }