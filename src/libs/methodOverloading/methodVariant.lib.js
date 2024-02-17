const { property_metadata_t, function_variant_param_node_metadata_t, metaOf, function_variant_param_node_endpoint_metadata_t } = require("../../reflection/metadata");
//const { estimateArgType } = require("./methodArgsEstimation.lib.lib");
const { retrieveTrie } = require("./methodVariantTrieOperation.lib");
const { getTypeOf } = require("../type");
const { estimateArgs } = require("./methodArgsEstimation.lib");
const { Interface } = require("../../interface");
const MethodVariantMismatchError = require("./error/methodVariantMismatchError");

/**
 * because of using a number (which is 4 bytes floating point) as 
 * statistic rows of statistic table therefore the maximum parameters 
 * for the estimation is 32, so bias for interface delta will
 * be 1 divided to 32 in order to not only mark method variants with interface has 
 * less priority than traditional classes but also not affect much in the calculated
 * distance between arguments and the method variant's signature. The less distances betwwen
 * arguments and signature, the more priority the signature is and when parameters reach 
 * 32 Interfaces, the distance just increased by 1 (this case is hard to happen in real application).
 * 
 * eg. the following pseudo code represent the issue.
 * 
 * class Foo implements IDisposable
 * 
 * given 2 signatures
 * a = (Number, Foo, String)
 * b = (Number, IDisposable, String)
 * 
 * given an arguments list determined args = [1, new Foo(), 'foo']
 * 
 * distance(args, a) = delta(args[0], a[0]) + delta(args[1], a[1]) + delta(args[2], a[2]) 
 *    = 0 + 0 + 0 
 *    = 0
 * 
 * distance(args, b) = delta(args[0], b[0]) + delta(args[1], b[1]) + delta(args[2], b[2])
 *    = 0 + (0+1/32) + 0 
 *    = 1/32
 * 
 * as we can see, the two signatures a and b are relavant to each other, but a has more
 * priority than b because types of signature a is more explicit than b's types.
 */
const INTERFACE_BIAS = 1/32;

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
    
    try {

        const trieEndpoint = diveTrieByArguments(getTypeOf(binder), propMeta, args);        
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
            
            return trieEndpoint.vTable.get(typeMeta).call(binder, ...args);
        }

        _class = Object.getPrototypeOf(_class);
    }

    throw new MethodVariantMismatchError();
}

/**
 * 
 * @param {MethodVariantMismatchError} e 
 */
function traceAndHandleMismatchVariant(e) {

    throw e;
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
    console.log(estimation)
    console.timeEnd('estimation time');
    if (
        !Array.isArray(estimation) ||
        estimation.length === 0
    ) {

        return false;
    }

    console.time('calc')
    const targetTrie = retrieveTrie(propMeta);
    const ret = retrieveEndpointByEstimation(targetTrie, estimation)?.endpoint;
    console.timeEnd('calc')

    return ret;
} 

/**
 * 
 * @param {function_variant_param_node_metadata_t} trieNode 
 * @param {Array<Object>} estimations 
 */
function retrieveEndpointByEstimation(trieNode, estimations, distance = 0) {

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

            continue;
        }

        const nextNode = trieNode.current.get(type);
        const d = calculateDistance(distance, delta, (type instanceof Interface));

        if (nextNode.endpoint) {

            nearest = min(nearest, {
                delta: d,
                endpoint: nextNode.endpoint
            });
        }

        nearest = min(nearest, retrieveEndpointByEstimation(
            nextNode, estimations, d
        ));
    }

    return nearest;
}

function calculateDistance(ref, delta, isInterface = false) {

    return ref + delta + isInterface ? INTERFACE_BIAS : 0;
}

function min(left, right) {

    return (left?.delta || Infinity) < (right?.delta || Infinity) ? left : right;
}