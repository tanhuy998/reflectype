const { Interface } = require("../../interface");
const { parameter_metadata_t, function_variant_param_node_metadata_t, property_metadata_t, metaOf } = require("../../reflection/metadata");
const Any = require("../../type/any");
const { getTypeOf, isValuable } = require("../type");
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
    addStatisticalPieace,
    estimateArgType,
    typeStatisticallyExistsOn,
    estimateArgs
}

/**
 * 
 * @param {parameter_metadata_t} paramMeta 
 * @param {function_variant_param_node_metadata_t} variantNodeMeta 
 * @param {?Map<Function, number>} statisticTable 
 */
function addStatisticalPieace(paramMeta, variantNodeMeta, statisticTable) {

    try {

        ensureStatisticTableExists(statisticTable);
        acknowledge(paramMeta.type, variantNodeMeta.depth, statisticTable);
    }
    catch {

        return;
    }
}


/**
 *
 * @param {?Map<Function, number>} statisticTable 
 * @param {Function} _type 
 * @param {number} index 
 */
function typeStatisticallyExistsOn(statisticTable, _type, index = 0) {

    try {

        ensureStatisticTableExists(statisticTable);

        const targetPiece = statisticTable.get(_type) || 0;
        const targetBit = (1 << index);

        return (targetPiece & targetBit) === targetBit;
    }
    catch {

        return false;
    }
}
/**
 * 
 * @param {Function} _type 
 * @param {number} index 
 * @param {Map<Function, number>} statisticTable 
 */
function acknowledge(_type, index = 0, statisticTable) {

    const targetPiece = statisticTable.get(_type) || 0;

    statisticTable.set(_type, (1 << index) | targetPiece);
}

function ensureStatisticTableExists(statisticTable) {

    if (!(statisticTable instanceof Map)) {

        throw new ReferenceError();
    }
}

/**
 * 
 * @param {property_metadata_t} propMeta 
 */
function getVariantMapOf(propMeta) {
    
    if (!propMeta.isMethod) {

        return;
    }

    const variantMaps = propMeta.owner.typeMeta.methodVariantMaps;
    return propMeta.static ? variantMaps?.static : variantMaps?._prototype;
}


function estimateArgs(propMeta, args = []) {

    const statisticTable = getVariantMapOf(propMeta)?.statisticTable;

    if (!statisticTable) {
        
        throw new ReferenceError();
    }

    let ret;
    let index = 0;

    for (const argVal of args || []) {

        const estimatedTypes = estimateArgType(argVal, index, statisticTable);
        
        if (
            !Array.isArray(estimatedTypes) ||
            estimatedTypes.length === 0
        ) {
            /**
             * throwing error here in order to 
             */
            throw new MethodVariantMismatchError(propMeta, ret);
        }

        (ret ||= []).push(estimatedTypes);

        ++index;
    }

    return ret;
}

function calculateDelta() {


}

/**
 * 
 * @param {Function} _type 
 * @param {number} index 
 * @param {?Map<Function, number>} statisticTable 
 */
function diveInheritanceChain(_type, index, statisticTable, bias = false) {

    if (!isValuable(_type)) {

        return undefined;
    }

    let ret;
    let currentType = _type;
    let delta = bias ? INTERFACE_BIAS : 0;

    while (
        currentType !== Object.getPrototypeOf(Function)
    ) {
        
        if (
            typeStatisticallyExistsOn(statisticTable, currentType, index)
        ) {
            //console.log(['choose'], currentType)
            (ret ||= []).push({
                type: currentType,
                delta
            });
        }

        ++delta;
        currentType = Object.getPrototypeOf(currentType);
    }

    return ret;
}

/**
 * 
 * @param {any} argVal 
 * @param {number} index
 * @param {?Map<Function, number>} statisticTable 
 * 
 * @returns {?Array<Function>}
 */
function estimateArgType(argVal, index = 0, statisticTable) {

    let ret;

    try {
        ensureStatisticTableExists(statisticTable);
        
        ret = diveInheritanceChain(getTypeOf(argVal), index, statisticTable);

        for (const intf of getAllInterfacesOf(argVal) || []) {

            ret = [...(ret||[]), ...(diveInheritanceChain(intf, index, statisticTable, true)||[])];
        }
    }
    catch {}
    finally {

        if (
            (!Array.isArray(ret) || ret.length === 0)
            &&
            typeStatisticallyExistsOn(statisticTable, Any, index)
        ) {
            /**
             * when there no types defined in the index, 
             * check for the existence of Any in the variant trie.
             */
            (ret ??= []).push({
                type: Any,
                delta: Infinity,
            });
        }
        console.log(getAllInterfacesOf(argVal), ret)
        return ret;
    }
}

/**
 * 
 * @param {Object|Function} _unknown 
 * @returns {Array<Interface>}
 */
function getAllInterfacesOf(_unknown) {

    const _type = getTypeOf(_unknown);
    const meta = metaOf(_type)?.interfaces?.properties;

    return typeof meta === 'object' ? Object.values(meta) : undefined;
}

