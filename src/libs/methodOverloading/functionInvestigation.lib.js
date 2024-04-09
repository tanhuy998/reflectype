const { 
    property_metadata_t, 
    function_variant_param_node_metadata_t, 
    metaOf, 
    function_variant_param_node_endpoint_metadata_t, 
    function_metadata_t, 
    parameter_metadata_t, 
    metadata_t 
} = require("../../reflection/metadata");
const { getTypeOf, isAbstract } = require("../type");
const { estimateArgs } = require("./methodArgsEstimation.lib");
const { Interface } = require("../../interface");
const MethodVariantMismatchError = require("./error/methodVariantMismatchError");
const {FUNC_TRIE} = require('./registry/function.reg');
const { estimation_report_t, vector } = require("./estimationFactor");
const { getVPtrOf } = require("../typeEnforcement.lib");
const { mergeArgBranch } = require("./argLookup.lib");

module.exports = {
    investigateGenericImplementation
}

function investigateGenericImplementation(binder, genericPropMeta, args = []) {

    const genericFuncMeta = genericPropMeta.functionMeta;
    const trieEndpoint = args.length === 0 ?
        FUNC_TRIE.endpoint
        : lookupEndpointNode(getTypeOf(binder), genericFuncMeta, args);

    if (
        !trieEndpoint
    ) {

        throw new MethodVariantMismatchError(genericFuncMeta, args);
    }

    const genericImplementation = extractGenericImplementation(binder, trieEndpoint, genericPropMeta, args);

    if (typeof genericImplementation === 'object') {

        mergeArgBranch(genericFuncMeta, genericImplementation, args);
    }

    return genericImplementation;
}

/**
 * 
 * @param {Function|Object} binder the object that bound with the function when invoking it.
 * @param {function_variant_param_node_endpoint_metadata_t} trieEndpoint the lookedup trie 
 * endpoint that match the input signature.
 * @param {property_metadata_t} propMeta the propMeta that is registered to the entry point 
 * for overloading function, its role is just loopback point.
 * @param {Array<any>} args input arguments.
 */
function extractGenericImplementation(binder, trieEndpoint, propMeta, args) {

    let _class = propMeta.owner.typeMeta.abstract;
    const actualType = getTypeOf(binder);

    /**@type {Function|typeof Interface} */
    const vPtr = getVPtrOf(binder);
    const funcName = propMeta.name;
    const vPtr_is_interface = vPtr?.prototype instanceof Interface;

    if (
        isAbstract(vPtr) &&
        vPtr !== _class &&
        (_class.prototype instanceof vPtr
            || vPtr_is_interface //&& vPtr.hasImplementer(_class)
        )
    ) {

        _class = !vPtr_is_interface ? vPtr : metaOf(_class).interfaces.list.get(vPtr);
    }

    while (
        _class !== Object.getPrototypeOf(Function)
    ) {
        /**@type {metadata_t} */
        const typeMeta = metaOf(_class);
        const variantMaps = typeMeta.methodVariantMaps;
        const targetMap = propMeta.static ? variantMaps.static : variantMaps._prototype;
        const genericFuncMeta = targetMap.mappingTable.get(funcName)?.functionMeta;
        const genericImplementation = trieEndpoint.dispatchTable.get(genericFuncMeta);

        if (
            typeof genericImplementation === 'object'
        ) {

            // return !genericImplementation.isVirtual ? 
            //     genericImplementation
            //     : extractVirtualFunction(
            //         genericImplementation , vPtr, actualType
            //     );

            return genericImplementation;
        }

        _class = Object.getPrototypeOf(_class);
    }

    throw new MethodVariantMismatchError(propMeta.functionMeta, args);
}

/**
 * 
 * @param {Function} _class 
 * @param {function_metadata_t} funcMeta 
 * @param {Array} args 
 * 
 * @returns {function_variant_param_node_endpoint_metadata_t}
 */
function lookupEndpointNode(_class, funcMeta, args) {

    //console.time('estimation time');
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
    //console.timeEnd('estimation time');
    if (
        estimationReport?.constructor !== estimation_report_t
    ) {

        return false;
    }

    //console.time('calc')
    const targetTrie = FUNC_TRIE;
    const ret = retrieveMostSpecificApplicableEndpoint(targetTrie, estimationReport)?.endpoint;
    //console.timeEnd('calc')

    return ret;
}

/**
 * 
 * @param {function_variant_param_node_metadata_t} trieNode 
 * @param {estimation_report_t} estimationReport
 * @param {number} dMass
 * @param {number} dImaginary
 */
function retrieveMostSpecificApplicableEndpoint(
    trieNode,
    estimationReport,
    dVector = new vector(Infinity, Infinity)
) {

    const { estimations, argMasses } = estimationReport || new estimation_report_t();
    const estimationPiece = estimations[trieNode.depth];
    const argslength = estimations.length;
    /**
     * Initial nearest variant,
     * endpoint for the initial nearest is 
     * the method variant whose signature is null
     * if exists.
     */
    let nearest = {
        vector: dVector
    };

    if (
        trieNode.depth === argslength//estimations.length 
    ) {
        /**
         * pivot condition when we reach the trie node whose depth is equal 
         * to the last estimation piece (also known as last argument)
         */
        nearest.endpoint = trieNode.endpoint;
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

        const nextNode = trieNode.current.get(type)
        const d = new vector(
            (dVector.real === Infinity ? 0 : dVector.real) + delta,
            (dVector.imaginary === Infinity ? 0 : dVector.imaginary) + imaginary
        );

        nearest = min(nearest, retrieveMostSpecificApplicableEndpoint(
            nextNode, estimationReport, d
        ));
    }

    return nearest;
}

/**
 * 
 * @param {vector} v
 * 
 * @returns {number}
 */
function modulus(v = new vector(Infinity, Infinity)) {

    const { real, imaginary } = v;

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
}