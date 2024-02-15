const { parameter_metadata_t, function_variant_param_node_metadata_t, property_metadata_t } = require("../../reflection/metadata");
const Any = require("../../type/any");
const { getTypeOf, getAllInterfacesOf } = require("../type");
const MethodVariantMismatchError = require("./error/methodVariantMismatchError");

const INTERFACES = 1;
const CLASSES = 0;

/**
 * 
 */

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

        //const _type = paramMeta.type;
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
function diveInheritanceChain(_type, index, statisticTable) {

    let ret;
    let currentType = _type;
    let delta = 0;

    while (
        currentType !== Object.getPrototypeOf(Function)
    ) {

        if (
            typeStatisticallyExistsOn(statisticTable, currentType, index)
        ) {

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

            ret = [...(ret||[]), ...(diveInheritanceChain(intf, index, statisticTable)||[])];
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
                delta: -1,
            });
        }

        return ret;
    }
}

