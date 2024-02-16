const { property_metadata_t, function_variant_param_node_metadata_t } = require("../../reflection/metadata");
//const { estimateArgType } = require("./methodArgsEstimation.lib.lib");
const { retrieveTrie } = require("./methodVariantTrieOperation.lib");
const { getTypeOf } = require("../type");
const { estimateArgs } = require("./methodArgsEstimation.lib");

module.exports = {
    diveTrieByArguments,
}

/**
 * 
 * @param {Function} _class 
 * @param {property_metadata_t} propMeta 
 * @param {Array} args 
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

        if (nextNode.endpoint) {
            //console.log(2)
            nearest = min(nearest, {
                delta: distance,
                endpoint: nextNode.endpoint
            });
        }

        nearest = min(nearest, calculate(nextNode, estimations, distance + delta));

        //console.log(nearest)
    }

    return nearest;
}

function min(left, right) {

    return left.delta < right.delta ? left : right;
}

/**
 * 
 * @param {Function} _type 
 * @param {function_variant_param_node_metadata_t} currentNode 
 * @param {Array<Function>} stack
 * @param {Array<Array>} map 
 */
function diveInheritanceChain(_type, currentNode, stack, map) {

    const recoverPoint = stack.length;
    let currentType = _type;

    while (
        currentType !== Object.getPrototypeOf(Function)
    ) {

        if (currentNode.current.has(currentType)) {

            const nextNode = currentNode.current.get(currentType);

            stack.push(currentType);
            diveInheritanceChain();
        }

        currentType = Object.getPrototypeOf(currentType);
    }

    /**
     * recover to the initial state of the stack
     */
    while (
        stack.length !== recoverPoint &&
        stack.length !== 0
    ) {

        stack.pop();
    }
}