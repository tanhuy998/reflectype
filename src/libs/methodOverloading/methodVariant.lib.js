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

    const variantMaps = propMeta.owner.typeMeta.methodVariantMaps;
    const targetMap = propMeta.static ? variantMaps?.static : variantMaps._prototype;
    const statisticTable = targetMap.statisticTable;

    if (!statisticTable) {

        return false;
    }

    const estimation = estimateArgs(propMeta, args);

    if (
        !Array.isArray(estimation) ||
        estimation.length === 0
    ) {

        return false;
    }

    const targetTrie = retrieveTrie(propMeta);
    // const iterator = args[Symbol.iterator]();
    // let iteration = iterator.next();
    // let index = 0;
    let iterationNode = targetTrie;

    return calculate(targetTrie, estimation)?.endpoint;

    const map = [];
    //const stack = [];

    // while (estimation.length) {
    //     /**
    //      * currentEstimation is always evaluated
    //      */
    //     const currentEstimation = estimation.shift();

    //     for (const _type of currentEstimation) {


    //     }
    // }

    // while(
    //     iterationNode?.current.size > 0 ||
    //     //!iterationNode?.endpoint ||
    //     !iteration.done
    // ) {

    //     const currArgType = getTypeOf(iteration.value);
    //     const argTypeEstimattions = estimateArgType(currArgType, index, statisticTable);

    //     if (
    //         !iterationNode.endpoint &&
    //         (
    //             !Array.isArray(argTypeEstimattions) ||
    //             argTypeEstimattions.length === 0
    //         )
    //     ) {
    //         /**
    //          * when there are no type estimations of the current argument index
    //          * and the there are no enpoint of the current node, it means that 
    //          * arguments list not match any variant signatures.
    //          */
    //         throw new ReferenceError();
    //     }

    //     diver

    //     ++index;
    //     iteration = iterator.next();


    // }
} 

/**
 * 
 * @param {function_variant_param_node_metadata_t} trieNode 
 * @param {Array<Object>} estimations 
 */
function calculate(trieNode, estimations, distance = 0) {

    const estimationPiece = estimations[trieNode.depth];

    let nearest = {
        delta: Infinity,
        endpoint: undefined
    };

    for (const {type, delta} of estimationPiece || [{}]) {

        if (!trieNode.current.has(type)) {

            continue;
        }

        if (trieNode.endpoint) {

            nearest = min(nearest, {
                delta: distance,
                endpoint: trieNode.endpoint
            });
        }

        nearest = min(nearest, calculate(trieNode.current.get(type), estimations, distance + delta));
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