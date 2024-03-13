'use strict';

const { Interface } = require("../../interface");
const { parameter_metadata_t, function_variant_param_node_metadata_t, property_metadata_t, metaOf, function_metadata_t } = require("../../reflection/metadata");
const Any = require("../../type/any");
const { getCastedTypeOf } = require("../casting.lib");
const { STATISTIC_TABLE } = require("../metadata/registry/function.reg");
const { getTypeOf, isValuable } = require("../type");
const { ESTIMATION_MASS, NULLABLE } = require("./constant");
const MethodVariantMismatchError = require("./error/methodVariantMismatchError");
const { estimation_complex_t, estimation_report_t, EstimationPieace } = require("./estimationFactor");

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
const HANDLE_CAST = 'handle_cast';
const CASTED = 'casted';

module.exports = {
    addStatisticalPieace,
    estimateArgType,
    typeStatisticallyExistsOn,
    estimateArgs,
    
}

/**
 * 
 * @param {parameter_metadata_t} paramMeta 
 * @param {function_variant_param_node_metadata_t} variantNodeMeta 
 * @param {?Array<Map<Function, number>>} statisticTables 
 */
function addStatisticalPieace(paramMeta, variantNodeMeta, statisticTables = []) {

    for (const table of statisticTables) {

        try {
        
            ensureStatisticTableExists(table);
            acknowledge(paramMeta.type, variantNodeMeta.depth, table);

            if (paramMeta.allowNull) {

                acknowledge(NULLABLE, variantNodeMeta.depth, table);
            }
        }
        catch (e) {
    
            continue;
        }
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

/**
 * 
 * @param {function_metadata_t} funcMeta 
 * @param {Array<any>} args 
 * @returns {estimation_report_t?}
 */
function estimateArgs(funcMeta, args = []) {

    if (args.length === 0) {

        return [];
    }
    //console.log(args)
    const statisticTable = getVariantMapOf(funcMeta.owner)?.statisticTable;

    if (!statisticTable) {
        
        throw new ReferenceError();
    }

    let ret;
    let argMasses;
    let index = 0;

    let hasNullable;
    
    for (const argVal of args || []) {

        const estimationPiece = estimateArgType(argVal, index, statisticTable);
        
        if (
            //!Array.isArray(estimationPiece) ||
            estimationPiece.length === 0
        ) {
            /**
             * throwing error here in order to 
             */
            return undefined;
        }
        
        hasNullable ||= estimationPiece[NULLABLE];
        (ret ||= []).push(estimationPiece);
        (argMasses ||= []).push(estimationPiece[ESTIMATION_MASS]);

        ++index;
    }
    
    //return [ret, argMasses, hasNullable];
    return new estimation_report_t(ret, argMasses, hasNullable);
    //return ret;
}

function calculateDelta() {


}

/**
 * 
 * @param {Function} _type 
 * @param {number} index 
 * @param {?Map<Function, number>} statisticTable 
 * @param {EstimationPieace} estimationPiece 
 * @param {number|boolean} bias
 * 
 * @returns {EstimationPieace}
 */
function diveInheritanceChain(_type, index, statisticTable, estimationPiece, bias = 0) {
    
    let currentType = _type;
    let delta = typeof bias === 'number' ? bias : 0;
    let mass = delta;

    let isNullable;
    
    while (
        currentType !== Object.getPrototypeOf(Function)
        && typeof currentType === 'function'
    ) {

        decideToChoose(currentType, index, statisticTable, estimationPiece, delta);

        ++delta;
        ++mass;
        
        currentType = Object.getPrototypeOf(currentType);
    }

    if (
        typeof _type === 'function'
        && !bias
    ) {
        /**
         * when there is bias value, thera too situation of the current argument value:
         * - the current argument is an instance of a class
         * - the current argument is casted as interface
         */
        decideToChoose(Object, index, statisticTable, estimationPiece, delta);

        ++mass;
    } 
    else if (
        _type === NULLABLE
    ) {
        /**
         * when _type is not function, it means the argument passed to 
         * the generic function is type of nullable (null or undefined)
         */
        decideToChoose(NULLABLE, index, statisticTable, estimationPiece);
        isNullable = estimationPiece.length === 1;
    }

    if (
        //Array.isArray(estimationPiece)
        !bias
    ) {
        
        estimationPiece[ESTIMATION_MASS] = mass;
        estimationPiece[NULLABLE] = isNullable;
    }
    
    //console.log('mass', [_type?.name || _type], mass)
    //return estimationPiece;
}

/**
 * 
 * @param {Function|symbol} _type 
 * @param {number} index 
 * @param {Map<Function, Number>} statisticTable 
 * @param {number} delta 
 * @param {EstimationPieace} estimationPiece 
 * @returns 
 */
function decideToChoose(_type, index, statisticTable, estimationPiece, delta = 0, inmaginary = 0) {

    if (
        !typeStatisticallyExistsOn(statisticTable, _type, index)
    ) {

        return;// estimationPiece;
    }   

    //console.log('choose', [_type?.name || _type], delta);

    estimationPiece.push(new estimation_complex_t(
        _type, delta, inmaginary
    ));

    //return estimationPiece;
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

    const _type = getCastedTypeOf(argVal) || getTypeOf(argVal) || NULLABLE;
    //console.log(`-------------- index ${index} | type`, [_type.name],`---------------`)
    const estimationPiece = new EstimationPieace(_type);
    diveInheritanceChain(_type, index, statisticTable, estimationPiece);

    if (
        typeof _type === 'function'
        && !(_type instanceof Interface)
    ) {

        diveInterfaces(argVal, index, statisticTable, estimationPiece);
    }

    if (
        estimationPiece.length === 0
    ) {

        decideToChoose(Any, index, statisticTable, estimationPiece, 0, 1);
    }

    //console.log(estimationPiece)

    return estimationPiece;
}

/**
 * 
 * @param {any} argVal 
 * @param {Map<Function, Number>} statisticTable
 * @param {EstimationPieace} estimationPeace
 * 
 * @returns {EstimationPieace} 
 */
function diveInterfaces(argVal, index, statisticTable, estimationPeace) {

    const bias = estimationPeace[ESTIMATION_MASS] + INTERFACE_BIAS;
    const interfaceList = getAllInterfacesOf(argVal);

    if (
        !isValuable(interfaceList?.length) ||
        interfaceList.length === 0
    ) {

        return;
    }

    //for (const intf of getAllInterfacesOf(argVal) || []) {
    for (let i = 0; i < interfaceList.length; ++i)  {
        
        const intf = interfaceList[i];
        diveInheritanceChain(
            intf,
            index, 
            statisticTable, 
            estimationPeace, 
            bias
            //estimationPeace?.[ESTIMATION_MASS]
        );
    }
    
    return estimationPeace;
}

/**
 * 
 * @param {any} argVal 
 * @param {number} index
 * @param {?Map<Function, number>} statisticTable 
 * 
 * @returns {?Array<Function>}
 */
function _estimatePotentialType(argVal, index = 0, statisticTable) {

    //throwIfCastedTypeExist(argVal);        
    //console.time(1)
    const _type = getCastedTypeOf(argVal) || getTypeOf(argVal);
    //const _type = getTypeOf(argVal)
    //console.timeEnd(1)
    let ret = diveInheritanceChain(_type/*getTypeOf(argVal)*/, index, statisticTable);
    
    if (_type instanceof Interface) {

        return ret;
    }

    for (const intf of getAllInterfacesOf(argVal) || []) {

        (ret || []).push(...(diveInheritanceChain(intf, index, statisticTable, ret?.[ESTIMATION_MASS]) || []));
    }

    return ret;
}

function throwIfInterface(type) {

    const casted_type = getCastedTypeOf(argVal);

    if (!casted_type) {

        return;
    }

    const e = new TypeError(HANDLE_CAST);
    e[CASTED] = casted_type;

    throw e;
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

