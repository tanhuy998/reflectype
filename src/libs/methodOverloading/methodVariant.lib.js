const { property_metadata_t, function_variant_param_node_metadata_t, metaOf, function_variant_param_node_endpoint_metadata_t, function_metadata_t, parameter_metadata_t } = require("../../reflection/metadata");
//const { estimateArgType } = require("./methodArgsEstimation.lib.lib");
const { retrieveTrie } = require("./methodVariantTrieOperation.lib");
const { getTypeOf, isValuable } = require("../type");
const { estimateArgs } = require("./methodArgsEstimation.lib");
const { Interface } = require("../../interface");
const MethodVariantMismatchError = require("./error/methodVariantMismatchError");
const { MULTIPLE_DISPATCH } = require("./constant");
const globalConfig = require('../../../config.json');
const { getAllParametersMeta } = require("../functionParam.lib");
const { getMetadataFootPrintByKey } = require("../footPrint");
const { DECORATED_VALUE } = require("../constant");
const { Any } = require("../../type");
const { static_cast } = require("../casting.lib");
const {STATISTIC_TABLE, FUNC_TRIE} = require('../metadata/registry/function.reg');

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

        const trieEndpoint = diveTrieByArguments(getTypeOf(binder), propMeta.functionMeta, args);
        
        if (
            !trieEndpoint ||
            !trieEndpoint.vTable.has(propMeta.functionMeta)
        ) {
            
            throw new MethodVariantMismatchError();
        }
        //console.time('endpoint eval')
        //const ret = retrieveFuncMeta(binder, trieEndpoint, args);
        //console.timeEnd('endpoint eval')
        //return ret;

        //const funcMeta = extractFuncMeta(binder, trieEndpoint, args);

        const funcMeta = trieEndpoint.vTable.get(propMeta.functionMeta)
        return invoke(funcMeta, binder, args);
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
function extractFuncMeta(binder, trieEndpoint, args) {

    let _class = getTypeOf(binder);

    /**
     * Iterate throught inheritance chain,
     * catch first matched class exist the endpoint's vtable
     */
    while (
        _class !== Object.getPrototypeOf(Function)
    ) {
        
        const typeMeta = metaOf(_class);
        
        const funcMeta = trieEndpoint.vTable.get(typeMeta);

        // if (trieEndpoint.vTable.has(typeMeta)) {
            
        //     return trieEndpoint.vTable.get(typeMeta).call(binder, MULTIPLE_DISPATCH, ...args);
        // }

        if (typeof funcMeta === 'object') {

            return funcMeta;
        }

        _class = Object.getPrototypeOf(_class);
    }

    throw new MethodVariantMismatchError();
}

/**
 * 
 * @param {function_metadata_t} funcMeta 
 * @param {any} bindObject
 * @param {Array<any>} args
 */
function invoke(funcMeta, bindObject, args) {
    console.time('prepare invoke')
    /**@type {function} */
    const actualFunc = getMetadataFootPrintByKey(funcMeta.owner, DECORATED_VALUE);
    const paramMetas = getAllParametersMeta(funcMeta);
    console.timeEnd('prepare invoke')
    //console.log(funcMeta.owner)
    //args = castDownArgs(paramMetas, args);
    console.time('invoke')
    const ret = actualFunc.call(bindObject, MULTIPLE_DISPATCH, ...args);
    console.timeEnd('invoke');

    return ret;
    //return actualFunc.call(bindObject, ...args);
}

/**
 * 
 * @param {Array<parameter_metadata_t>} paramMetas 
 * @param {Array<any>} args 
 */
function castDownArgs(paramMetas, args) {

    const ret = [];
    let i = 0;
    console.time('down cast')
    for (const argVal of args) {
        //console.time('e')
        const meta = paramMetas[i++];
        const paramType = meta?.type;
        //console.timeEnd('e')
        ret.push((paramType === Any || meta.allowNull || !isValuable(meta) ? argVal : static_cast(paramType, argVal)));
        
    }
    console.timeEnd('down cast')
    return ret;
    //return args;
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
 * @param {function_metadata_t} funcMeta 
 * @param {Array} args 
 * 
 * @returns {function_variant_param_node_endpoint_metadata_t}
 */
function diveTrieByArguments(_class, funcMeta, args) {
    console.time('estimation time');
    const propMeta = funcMeta.owner
    // const variantMaps = propMeta.owner.typeMeta.methodVariantMaps;
    const variantMaps = propMeta.owner.typeMeta.methodVariantMaps;
    const targetMap = propMeta.static ? variantMaps?.static : variantMaps._prototype;

    const statisticTable = targetMap.statisticTable;
    //const statisticTable = STATISTIC_TABLE;

    if (!statisticTable) {

        return false;
    }

    const estimation = estimateArgs(funcMeta, args);
    //console.log(['e'], estimation)

    console.timeEnd('estimation time');
    if (
        !Array.isArray(estimation) ||
        estimation.length === 0
    ) {

        return false;
    }

    console.time('calc')
    //const targetTrie = retrieveTrie(propMeta);
    const targetTrie = FUNC_TRIE;
    //console.log(['trie'], targetTrie)
    const ret = retrieveEndpointByEstimation(targetTrie, estimation)?.endpoint;
    console.timeEnd('calc')
    
    return ret;
} 


/**
 * 
 * @param {function_variant_param_node_metadata_t} trieNode 
 * @param {Array<Object>} estimations 
 */
function retrieveEndpointByEstimation(trieNode, estimationFactors, distance = Infinity) {
    
    const [estimations, argMasses] = estimationFactors || [undefined, undefined];
    const estimationPiece = estimations[trieNode.depth];
    const argslength = estimations.length;
    /**
     * Initial nearest variant,
     * endpoint for the initial nearest is 
     * the method variant whose signature is null
     * if exists.
     */
    let nearest = {
        //delta: trieNode.endpoint ? (estimationPiece?.[undefined] || 0) * (estimations.length - trieNode.depth) + distance : distance,
        //endpoint: trieNode.endpoint || undefined
        delta: distance
    };
    
    // if (trieNode.endpoint) {

    //     console.log(['init nearest'], 'has endpoint', typeof trieNode.endpoint === 'object', 'at', trieNode.depth)
    //     console.log((estimationPiece?.[undefined] || 0) * (estimations.length - trieNode.depth) + distance)
    //     console.log(['init delta'], nearest.delta)
    // }
    //console.log(['p'], estimationPiece)
    if (
        trieNode.depth === argslength//estimations.length 
    ) {
        /**
         * anchor condition when we reach the trie node whose depth is equal 
         * to the last estimation piece (also known as last argument)
         */
        //console.log(['anchor'],trieNode.depth, nearest.delta)
        nearest.endpoint = trieNode.endpoint;
        return nearest;
    }

    for (const {type, delta} of estimationPiece || [{}]) {
        
        if (
            !trieNode.current.has(type)
        ) {

            continue;
        }

        const nextNode = trieNode.current.get(type);
        const d = calculateDistance(distance, delta, (type instanceof Interface));
 
        // if (nextNode.endpoint) {

        //     nearest = min(nearest, {
        //         delta: d,
        //         endpoint: nextNode.endpoint
        //     });
        // }

        nearest = min(nearest, retrieveEndpointByEstimation(
            nextNode, estimationFactors, d
        ));

        if (
            globalConfig.multipleDispatchStrictLength !== true &&
            trieNode.endpoint
        ) {
    
            const mass = calculateMass(trieNode.depth + 1, argslength - 1, argMasses);
    
            nearest = min(nearest, {
                delta: d + mass,
                endpoint: trieNode.endpoint
            })
        }
    }

    return nearest;
}

/**
 * 
 * @param {number} from 
 * @param {number} to 
 * @param {Array<Number>} argMasses 
 */
function calculateMass(from, to, argMasses) {

    let sum = 0;

    for (let i = from; i < to; argMasses) {

        sum = argMasses[i];
    }

    return sum;
}

function debugNearest(nearest) {

    return nearest.endpoint?.vTable.keys()
}

function calculateDistance(ref, delta, isInterface = false) {

    return (ref === Infinity ? 0 : ref) + delta; //+ isInterface ? INTERFACE_BIAS : 0;
}

function min(left, right) {

    if (
        !left.endpoint &&
        right.endpoint
    ) {

        return right;
    }

    const ld = typeof left.delta !== 'number' || !left.endpoint ? Infinity : left.delta;
    const rd = typeof right.delta !== 'number' || !right.endpoint ? Infinity : right.delta;

    return ld < rd ? left : right;
}