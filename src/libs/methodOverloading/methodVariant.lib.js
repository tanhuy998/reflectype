const { 
    property_metadata_t, 
    function_variant_param_node_metadata_t, 
    metaOf, 
    function_variant_param_node_endpoint_metadata_t, 
    function_metadata_t, 
    parameter_metadata_t, 
    metadata_t 
} = require("../../reflection/metadata");
const { getTypeOf, isValuable, isAbstract } = require("../type");
const { estimateArgs } = require("./methodArgsEstimation.lib");
const { Interface } = require("../../interface");
const MethodVariantMismatchError = require("./error/methodVariantMismatchError");
const { MULTIPLE_DISPATCH } = require("./constant");
const { getAllParametersMeta } = require("../functionParam.lib");
const { getMetadataFootPrintByKey } = require("../footPrint");
const { DECORATED_VALUE, DISPATCH_FUNCTION } = require("../constant");
const { Any } = require("../../type");
const { static_cast, getCastedTypeOf } = require("../casting.lib");
const {FUNC_TRIE} = require('./registry/function.reg');
const { estimation_report_t, vector } = require("./estimationFactor");
const { extractVirtualFunction } = require("./virtualMethod.lib");
const { getVPtrOf, releaseVPtrOf } = require("../typeEnforcement.lib");
const { isProxy } = require("util/types");
const { lookupArgBranch, mergeArgBranch } = require("./argLookup.lib");
const { investigateGenericImplementation } = require("./functionInvestigation.lib");
const debug = require('debug')('pkg:methodOverloading:dispatch');

module.exports = {
    dispatchMethodVariant,
}

/**
 * 
 * @param {Object|Function|any} binder 
 * @param {property_metadata_t} propMeta 
 * @param {Array<any>} args 
 */
function dispatchMethodVariant(binder, propMeta, args) {

    const funcMeta = dispatchPotentialVirtualFunciton(
        propMeta,
        lookupArgBranch(propMeta.functionMeta, args)
        || investigateGenericImplementation(binder, propMeta, args)
        , binder
    )
    return invoke(funcMeta, binder, args);
}

/**
 * 
 * @param {property_metadata_t} inputGenPropMeta
 * @param {function_metadata_t} resolvedGenImpl 
 * @param {Function|object}
 * 
 * @returns {function_metadata_t}
 */
function dispatchPotentialVirtualFunciton(inputGenPropMeta, resolvedGenImpl, bindObj) {
    
    const actualType = getTypeOf(bindObj);
    /**@type {Function|typeof Interface} */
    /**
     *  The owner class of the generic propMeta is also the current virtual pointer
     */
    const vPtr = inputGenPropMeta.owner.typeMeta.abstract;
    
    return !resolvedGenImpl.isVirtual ? 
    resolvedGenImpl
    : extractVirtualFunction(
        resolvedGenImpl , vPtr, actualType
    );
}
/**
 * 
 * @param {function_metadata_t} funcMeta 
 * @param {any} bindObject
 * @param {Array<any>} args
 */
function invoke(funcMeta, bindObject, args) {
    
    //console.time('prepare invoke')
    /**@type {function} */
    const actualFunc = getMetadataFootPrintByKey(funcMeta, DISPATCH_FUNCTION);
    const paramMetaList = getAllParametersMeta(funcMeta);
    //console.timeEnd('prepare invoke')

    //console.time('cast down args');
    args = castDownArgs(paramMetaList, args);
    //console.timeEnd('cast down args')

    //console.time('invoke');
    bindObject = releaseVPtrOf(bindObject);

    const ret = actualFunc.call(bindObject, MULTIPLE_DISPATCH, ...args);
    //console.timeEnd("invoke");
    return ret;
}

/**
 * 
 * @param {Array<parameter_metadata_t>} paramMetas 
 * @param {Array<any>} args 
 */
function castDownArgs(paramMetas, args) {

    const ret = [];

    for (let i = 0; i < args.length; ++i) {

        const argVal = args[i];
        const meta = paramMetas[i];
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