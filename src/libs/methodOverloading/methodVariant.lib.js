const { 
    property_metadata_t, 
    function_variant_param_node_metadata_t, 
    metaOf, 
    function_variant_param_node_endpoint_metadata_t, 
    function_metadata_t, 
    parameter_metadata_t, 
    metadata_t 
} = require("../../reflection/metadata");
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
const {FUNC_TRIE} = require('../metadata/registry/function.reg');
const { function_signature_vector, estimation_report_t, vector } = require("./estimationFactor");

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

        const genericFuncMeta = propMeta.functionMeta;
        const trieEndpoint = args.length === 0 ?
            FUNC_TRIE.endpoint 
            : diveTrieByArguments(getTypeOf(binder), genericFuncMeta, args);
        
        if (
            !trieEndpoint //||
            //!trieEndpoint.vTable.has(propMeta.functionMeta)
        ) {
            
            throw new MethodVariantMismatchError(genericFuncMeta, args);
        }
        console.time('extract vtable')
        const funcMeta = extractFuncMeta(binder, trieEndpoint, propMeta, args);
        console.timeEnd('extract vtable')

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
 * @param {property_metadata_t} propMeta
 * @param {Array<any>} args 
 */
function extractFuncMeta(binder, trieEndpoint, propMeta, args) {

    let _class = propMeta.owner.typeMeta.abstract;

    const funcName = propMeta.name;
    /**
     * Iterate throught inheritance chain,
     * catch first matched class exist the endpoint's vtable
     */
    while (
        _class !== Object.getPrototypeOf(Function)
    ) {
        /**@type {metadata_t} */
        const typeMeta = metaOf(_class);
        const variantMaps = typeMeta.methodVariantMaps;
        const targetMap = propMeta.static ? variantMaps.static : variantMaps._prototype;

        const lookedupFuncMeta = targetMap.mappingTable.get(funcName)?.functionMeta;

        if (trieEndpoint.vTable.has(lookedupFuncMeta)) {
            
            return trieEndpoint.vTable.get(lookedupFuncMeta);
        }

        _class = Object.getPrototypeOf(_class);
    }

    throw new MethodVariantMismatchError(propMeta.functionMeta, args);
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
    
    const paramMetaList = getAllParametersMeta(funcMeta);
    console.timeEnd('prepare invoke')

    console.time('cast down args');
    args = castDownArgs(paramMetaList, args);
    console.timeEnd('cast down args')

    console.time('invoke');
    const ret = actualFunc.call(bindObject, MULTIPLE_DISPATCH, ...args);
    console.timeEnd("invoke");
    return ret;
}

/**
 * 
 * @param {Array<parameter_metadata_t>} paramMetas 
 * @param {Array<any>} args 
 */
function castDownArgs(paramMetas, args) {

    const ret = [];
    //let i = 0;

    for (let i = 0; i < args.length; ++i) {

        const argVal = args[i];
        const meta = paramMetas[i++];
        const paramType = meta?.type;

        ret.push(
            isValuable(paramType)
            || paramType === Any 
            || !isValuable(argVal)
            || !isValuable(meta) 
            || meta.allowNull ? 
                argVal : static_cast(paramType, argVal)
        );
    }

    return ret;
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
    const variantMaps = propMeta.owner.typeMeta.methodVariantMaps;
    const targetMap = propMeta.static ? variantMaps?.static : variantMaps._prototype;
    const statisticTable = targetMap.statisticTable;

    if (!statisticTable) {

        return false;
    }

    if (
        args.length === 0
    ) {

        return FUNC_TRIE.endpoint;
    }

    const estimationReport = estimateArgs(funcMeta, args);
    console.timeEnd('estimation time');
    if (
        estimationReport?.constructor !== estimation_report_t
    ) {

        return false;
    }

    console.time('calc')
    const targetTrie = FUNC_TRIE;
    const ret = retrieveMostSpecificApplicableEndpoint(targetTrie, estimationReport)?.endpoint;
    console.timeEnd('calc')
    
    return ret;
} 

/**
 * 
 * @param {function_metadata_t} funcMeta 
 * 
 * @returns {function_variant_param_node_metadata_t}
 */
function retrieveLocalTrieOf(funcMeta) {

    const variantMaps = funcMeta.owner.owner.typeMeta.methodVariantMaps;
    const targetMap = funcMeta.owner.static ? variantMaps.static : variantMaps._prototype;

    return targetMap.localTrie;
}

/**
 * 
 * @param {function_variant_param_node_metadata_t} trieNode 
 * @param {estimation_report_t} estimationReport
 * @param {number} dMass
 * @param {number} dImaginary
 */
//function retrieveEndpointByEstimation(trieNode, estimationReport, dMass = Infinity, dImaginary = Infinity) {
function retrieveMostSpecificApplicableEndpoint(
  trieNode,
  estimationReport,
  dVector = new vector(Infinity, Infinity)
) {
    
    const {estimations, argMasses} = estimationReport || new estimation_report_t();
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
        vector: dVector//new function_signature_vector(dMass, dImaginary),
        // delta: dMass,
        // dImaginary: dImaginary,
    };
    
    if (
        trieNode.depth === argslength//estimations.length 
    ) {
        /**
         * anchor condition when we reach the trie node whose depth is equal 
         * to the last estimation piece (also known as last argument)
         */
        nearest.endpoint = trieNode.endpoint;
        //console.log(dVector);
        return nearest;
    }

    for (let i = 0; i < estimationPiece.length; ++i) {
        
        const {
            /**@type {Function}*/ type, 
            /**@type {number}*/ delta, 
            /**@type {number}*/ imaginary
        } = estimationPiece[i];
        
        if (
            !trieNode.current.has(type)
        ) {

            continue;
        }

        const nextNode = trieNode.current.get(type);
        //const d = calculateDistance(dMass, delta, (type instanceof Interface));
        const d = new vector(
            (dVector.real === Infinity ? 0 : dVector.real) + delta, 
            (dVector.imaginary === Infinity ? 0 : dVector.imaginary) + imaginary
        );

        // if (nextNode.endpoint) {

        //     nearest = min(nearest, {
        //         delta: d,
        //         endpoint: nextNode.endpoint
        //     });
        // }

        // nearest = min(nearest, retrieveEndpointByEstimation(
        //     nextNode, estimationReport, d
        // ));

        nearest = min(nearest, retrieveMostSpecificApplicableEndpoint(
            nextNode, estimationReport, d
        ));

        // if (
        //     globalConfig.multipleDispatchStrictLength !== true &&
        //     trieNode.endpoint
        // ) {
    
        //     const mass = calculateMass(trieNode.depth + 1, argslength - 1, argMasses);
    
        //     nearest = min(nearest, {
        //         delta: d + mass,
        //         endpoint: trieNode.endpoint
        //     })
        // }
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

/**
 * 
 * @param {vector} v
 * 
 * @returns {number}
 */
function modulus(v = new vector(Infinity, Infinity)) {

    const { real, imaginary } = v;

    // if (!imaginary) {

    //     return real;
    // }

    return !imaginary ? real : Math.sqrt(real ** 2 + imaginary ** 2);
}

function min(left, right) {

    if (
        !left.endpoint &&
        right.endpoint
    ) { 

        return right;
    }

    if (
        left.endpoint 
        && !right.endpoint
    ) {

        return left;
    }

    return modulus(left.vector) < modulus(right.vector) ? left : right;

    const ld = typeof left.delta !== 'number' || !left.endpoint ? Infinity : left.delta;
    const rd = typeof right.delta !== 'number' || !right.endpoint ? Infinity : right.delta;

    return ld < rd ? left : right;
}