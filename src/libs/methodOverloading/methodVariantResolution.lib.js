'use strict'

const { 
    property_metadata_t, 
    function_variant_param_node_metadata_t, 
    function_variant_param_node_endpoint_metadata_t, 
    method_variant_map_metadata_t, 
    metaOf, 
    metadata_t, 
    method_variant_mapping_table_metadata_t, 
    parameter_metadata_t,
    function_metadata_t,
    function_variant_cache_node_endpoint_metadata_t
} = require("../../reflection/metadata");
const { DECORATED_VALUE, DECORATOR_APPLIED, ALTER_VALUE } = require("../constant");
const { getMetadataFootPrintByKey, setMetadataFootPrint } = require("../footPrint");
const { OVERLOAD_APPLIED, OVERLOAD_TARGET, OVERRIDE_APPLIED, OVERLOADED_METHOD_NAME, NULLABLE, FINAL_APPLIED } = require("./constant");
const { isObjectLike, isFirstClass, isObjectKey, isValuable } = require("../type");
const {getAllParametersMeta, getAllParametersMetaWithNullableFilter} = require('../functionParam.lib');
const { mergeFuncVariant } = require("./methodVariantTrieOperation.lib");
const { dispatchMethodVariant } = require("./methodVariant.lib");
const {FUNC_TRIE} = require('./registry/function.reg');
const { LEGACY_PROP_META, INHERITANCE_DEPTH } = require("../metadata/constant");
const { isPseudoMethod } = require("./pseudoMethod.lib");
const OverridingNonVirtualMethodError = require("./error/overridingNonVirtualMethodError");
const AmbigousSignatureConflictError = require("./error/ambigousSignatureConfilictError");
const debug = require('debug')('pkg:methodOverloading:resolution');

const IS_ENTRY_POINT = '_is_entry_point';

module.exports = {
    manipulateMethodVariantBehavior,
    manipulateMethodVariantsStatisticTables,
    //verifyInterfaceImplementation,
    isOwnerOfPropMeta,
    getNearestBaseImplementationPropMeta
}

/**
 * This function will register propMeta as method variant and locate the exact 
 * statistic table.
 * 
 * @this Function|Object class or class's prototype that is resolved resolution
 * 
 * @param {string|symbol} propName 
 * @param {property_metadata_t} propMeta 
 */
function manipulateMethodVariantBehavior(propName, propMeta) {

    const isOwner = isOwnerOfPropMeta.call(this, propName, propMeta);
    
    if (
        !propMeta.isMethod ||
        !isOwner
    ) {

        return;
    }
    
    if (isOverrideWithoutDecoration.call(this, propName, propMeta)) {
        const currentClass = typeof this === 'function' ? this : this.constructor;
        const overridedClass = propMeta.owner.typeMeta.abstract;
        throw new ReferenceError(`could not define undecorated method [${currentClass?.name}].${propName}() to override base class's decorated method [${overridedClass?.name}].${propName}()`);
    }
    
    if (
        !isPseudoMethod(propMeta) &&
        isOwner
    ) {
        
        registerMethodVariantGenericPropMeta(propMeta);
    }
    
    const isOverloading = isOverloadingMethod.call(this, propName, propMeta);
    const hasLegacy = isOverridingBaseClassMethod.call(this, propName, propMeta);
    // const ctxGenericPropMeta = retrieveContextGenericPropMeta.call(this, propName, propMeta);
    // let statisticTable;

    if (
        isOverloading
        || (hasLegacy && !propMeta.private)
        || isOwner && propMeta.functionMeta.isVirtual
        //&& !isPseudoMethod(propMeta)
    ) {

        const overloadedName = getMetadataFootPrintByKey(propMeta, OVERLOADED_METHOD_NAME) || propMeta.name;
        const genericPropMeta = retrieveMethodVariantTableOf(propMeta).mappingTable.get(overloadedName);
        createContextEntryPoint(genericPropMeta);
    }

    _register(propMeta);
}

/**
 * 
 * @param {property_metadata_t} propMeta 
 */
function _register(propMeta) {

    registerMethodVariant(propMeta);
    //const hasNullableBranch = registerPotentialNullableBranch(propMeta);
    //verifyPotentialFinalMethod(propMeta, hasNullableBranch);
}

/**
 * @this
 * 
 * @param {string|symbol} propName
 * @param {property_metadata_t} propMeta 
 * 
 * @returns {property_metadata_t}
 */
function retrieveContextGenericPropMeta(propName, propMeta) {

    if (isOverridingBaseClassMethod.call(this, propName, propMeta)) {

        return getMetadataFootPrintByKey(propMeta, LEGACY_PROP_META);
    }

    const overloadedName = getMetadataFootPrintByKey(propMeta, OVERLOADED_METHOD_NAME);
    
    return retrieveMethodVariantTableOf(propMeta).mappingTable.get(overloadedName);
}


/**
 * 
 * @param {property_metadata_t} propMeta 
 */
function registerMethodVariantGenericPropMeta(propMeta) {

    const variantMaps = propMeta.owner.typeMeta.methodVariantMaps;
    const mappingTable = propMeta.static ? 
                variantMaps.static.mappingTable 
                : variantMaps._prototype.mappingTable;
    
    mappingTable.set(propMeta.name, propMeta);
}

function isOverridingBaseClassMethod(propName, propMeta) {
    
    return isOwnerOfPropMeta.call(this, propName, propMeta) &&
            !isPseudoMethod(propMeta) &&
            getMetadataFootPrintByKey(propMeta, LEGACY_PROP_META)
}

/**
 * 
 * @param {property_metadata_t} propMeta 
 */
function createContextEntryPoint(propMeta) {

    const _class = propMeta.owner.typeMeta.abstract;
    const entryPointTarget = propMeta.static ? _class : _class.prototype;
    
    createEntryPoint(entryPointTarget, propMeta.name, propMeta);
}

/**
 *
 * @param {Function|Object} entryPointTarget 
 * @param {string|symbol} methodName 
 * @param {property_metadata_t} refPropMeta 
 */
function createEntryPoint(entryPointTarget , methodName, refPropMeta) {
    
    if (!isObjectLike(entryPointTarget)) {

        throw new TypeError();
    }
    
    if (
        !isObjectKey(methodName)
    ) {

        return;
    }

    const map = retrieveMethodVariantTableOf(refPropMeta);
    const genericPropMeta = map.mappingTable.get(methodName);

    if (!genericPropMeta) {

        return;
    }

    if (
        isVariantEntryPointFunction(getMetadataFootPrintByKey(
            refPropMeta, ALTER_VALUE
        ))
    ) {

        return;
    }

    const multiDispatchGenericEntryPoint = generateGenericEntryPoint(genericPropMeta);
    setMetadataFootPrint(genericPropMeta, ALTER_VALUE, multiDispatchGenericEntryPoint);
}

/**
 * 
 * @param {property_metadata_t} originPropMeta 
 */
function generateGenericEntryPoint(originPropMeta) {
    
    const ENTRY_POINT = function () {
        
        return dispatchMethodVariant(this, originPropMeta, arguments);
    }

    markAsVariantEntryPoint(ENTRY_POINT)

    return ENTRY_POINT;
}

/**
 * 
 * @param {Function} func 
 */
function isVariantEntryPointFunction(func) {

    return func?.[IS_ENTRY_POINT];
}

/**
 * 
 * @param {Function} func 
 */
function markAsVariantEntryPoint(func) {

    func[IS_ENTRY_POINT] = true;
}

/**
 * 
 * @param {property_metadata_t} hostPropMeta 
 * @param {Array<Map<Function, Number>>} extraStatisticTables
 */
function registerMethodVariant(hostPropMeta, extraStatisticTables = []) {

    const funcMeta = hostPropMeta.functionMeta;
    const paramMetaList = getAllParametersMeta(funcMeta) || [];
    const endpointNode = registerSignature(
        hostPropMeta, 
        paramMetaList, 
        extraStatisticTables
    );

    if (!endpointNode) {

        return;
    }

    validateWithBaseClassImplemetation(hostPropMeta, endpointNode);
    setEndpoint(endpointNode, hostPropMeta, funcMeta);
    // const genericPropMeta = retrieveGenericPropMetaOf(hostPropMeta);
    // endpointNode.endpoint.dispatchTable.set(genericPropMeta.functionMeta, funcMeta);
}

/**
 * 
 * @param {property_metadata_t} hostPropMeta 
 * @param {Array<Map<Function, Number>>} extraStatisticTables
 * 
 * @returns {boolean}
 */
function registerPotentialNullableBranch(hostPropMeta, extraStatisticTables = []) {

    const funcMeta = hostPropMeta.functionMeta;
    const nullableBranch = getAllParametersMetaWithNullableFilter(funcMeta);

    if (!nullableBranch) {

        return false;
    }

    const endPointNode = registerSignature(
        hostPropMeta, 
        nullableBranch, 
        extraStatisticTables
    );

    if (!endPointNode) {

        return false;
    }

    validateNullableBranch(funcMeta, endPointNode);
    setEndpoint(endPointNode, hostPropMeta, funcMeta);
    // const genericPropMeta = retrieveGenericPropMetaOf(hostPropMeta);
    // endPointNode.endpoint.dispatchTable.set(genericPropMeta.functionMeta, funcMeta);

    return true;
}

/**
 * 
 * @param {function_variant_param_node_metadata_t} trieNode 
 * @param {property_metadata_t} hostPropMeta 
 * @param {function_metadata_t} genericImplementation 
 */
function setEndpoint(trieNode, hostPropMeta, genericImplementation) {

    const genericPropMeta = retrieveGenericPropMetaOf(hostPropMeta);
    trieNode.endpoint.dispatchTable.set(genericPropMeta.functionMeta, genericImplementation);
    //const cache = trieNode.cache ??= new function_variant_cache_node_endpoint_metadata_t();
}

/**
 * Get paramMeta list of hostPropMeta register for new method variant of remotePropMeta
 * 
 * 
 * @param {property_metadata_t} hostPropMeta 
 * @param {Array<parameter_metadata_t>} paramMetaList 
 * @param {Array<Map<Function, Number>>} extraStatisticTables
 * @param {boolean} nullableBranch
 * 
 * @returns {function_variant_param_node_metadata_t|undefined}
 */
function registerSignature(hostPropMeta, paramMetaList, extraStatisticTables = []) {

    if (paramMetaList === null) {

        return;
    }

    const hostFuncMeta = hostPropMeta.functionMeta;
    const methodVariantTable = retrieveMethodVariantTableOf(hostPropMeta);
    const {statisticTable, localTrie} = methodVariantTable;
    const variantTrie = FUNC_TRIE;

    const endPointNode = mergeFuncVariant(
        paramMetaList, 
        variantTrie, 
        [statisticTable, ...extraStatisticTables]
    );
    
    const dispatchTable = endPointNode.endpoint.dispatchTable;

    const genericPropMeta = retrieveGenericPropMetaOf(hostPropMeta);
    const genericFuncMeta = genericPropMeta.functionMeta;
    
    const hasImplemetantion = dispatchTable.has(genericFuncMeta);
    const genericImplementation = dispatchTable.get(genericFuncMeta);
    
    if (
        hasImplemetantion
        && genericImplementation === hostPropMeta//genericFuncMeta
    ) {

        return undefined;
    }

    return endPointNode;
}



/**
 * 
 * @param {function_variant_param_node_metadata_t} rootTrieNode 
 * @param {property_metadata_t} genericPropMeta
 * @param {Array<parameter_metadata_t>} paramMetaList 
 * @param {Map<Function, Number>[]} statisticTables
 */
function mergeSignature(rootTrieNode, genericPropMeta, paramMetaList, statisticTables = []) {

    return mergeFuncVariant(
        paramMetaList, 
        rootTrieNode, 
        //[statisticTable, ...extraStatisticTables]
        statisticTables
    );
}

/**
 * @param {function_metadata_t} funcMeta
 * @param {function_metadata_t} genericImplementation 
 * @param {function_variant_param_node_metadata_t} endpointNode
 */
function validateNullableBranch(funcMeta, /*genericImplementation,*/ endpointNode) {

    const genericPropMeta = retrieveGenericPropMetaOf(funcMeta.owner);
    const genericImplementation = endpointNode.endpoint.dispatchTable.get(genericPropMeta.functionMeta);

    if (
        !genericImplementation 
        || funcMeta === genericImplementation
        || funcMeta.owner.static !== genericImplementation.owner.static
    ) {

        return;
    }

    throw new AmbigousSignatureConflictError(funcMeta, genericImplementation);
}


/**
 * 
 * @param {property_metadata_t} propMeta 
 */
function retrieveGenericPropMetaOf(propMeta) {

    const typeMeta = propMeta.owner.typeMeta;
    const variantMap = propMeta.static ? 
                typeMeta.methodVariantMaps.static 
                : typeMeta.methodVariantMaps._prototype;
    const genericMethodName = getMetadataFootPrintByKey(
        propMeta, 
        OVERLOADED_METHOD_NAME
    ) || propMeta.name;

    return variantMap.mappingTable.get(genericMethodName);
}

/**
 * 
 * @param {property_metadata_t} propMeta 
 * @param {function_variant_param_node_metadata_t} endpointNode
 */
function validateWithBaseClassImplemetation(propMeta, endpointNode) {
    
    const deicdeToOverride = getMetadataFootPrintByKey(propMeta, OVERRIDE_APPLIED);
    const isFinal = getMetadataFootPrintByKey(propMeta, FINAL_APPLIED);

    if (!endpointNode) {

        return;
    }

    if (!deicdeToOverride) {

        if (isFinal) {

            throw new Error();
        }

        return;
    }

    /**
     *  When decideToOverride === true
     */

    const virtualImplementation = lookupVirtualMethod(
        endpointNode.endpoint, propMeta
    );
    
    if (!virtualImplementation) {

        throw new OverridingNonVirtualMethodError(propMeta);
    }

    const baseImplementationPropMeta = getNearestBaseImplementationPropMeta(
        propMeta, endpointNode.endpoint
    );

    
    if (
        baseImplementationPropMeta.owner.typeMeta.abstract === Object.getPrototypeOf(propMeta.owner.typeMeta.abstract)
        && getMetadataFootPrintByKey(baseImplementationPropMeta, FINAL_APPLIED)
    ) {
        /**
         * prevent override base class final method
         */
        throw new Error('could not override base class final method');
    }

    virtualImplementation.vTable.set(
        propMeta.owner.typeMeta.abstract, propMeta.functionMeta
    );
}

/**
 * Lookup for the nearest virtual method, return undefined when there's
 * normal method exists on the prototype chain.
 * 
 * @param {function_variant_param_node_endpoint_metadata_t} nodeEndpoint 
 * @param {property_metadata_t} propMeta 
 * 
 * @returns {function_metadata_t|undefined}
 */
function lookupVirtualMethod(nodeEndpoint, propMeta) {

    let _class = Object.getPrototypeOf(propMeta.owner.typeMeta.abstract);

    while (
        _class !== Object.getPrototypeOf(Function)
    ) {
        
        for (const genericImplementation of nodeEndpoint.dispatchTable.values()) {

            if (
                genericImplementation.owner.static ||
                genericImplementation.owner.owner.typeMeta.abstract !== _class
                || getMetadataFootPrintByKey(genericImplementation.owner, OVERRIDE_APPLIED)
            ) {
                /**
                 * If there is no implemetation on the current class, it's mean the current
                 * class inherits it's base class implementation, just skip at current class 
                 * and vice versa when the current implementation is override method.
                 */      
                continue;
            }

            if (
                genericImplementation.isVirtual
            ) {

                return genericImplementation;
            }

            /**
             * When the current implementation is not only virtual but also override,
             * it's mean the current 'override' behavior apllied to the method is invalid.
             */
            return undefined;
        }

        _class = Object.getPrototypeOf(_class);
    }
}

/**
 * 
 * @param {property_metadata_t} propMeta 
 */
function verifyPotentialFinalMethod(propMeta, hasNullableBranch = false) {

    const isMarkedFinal = getMetadataFootPrintByKey(propMeta, FINAL_APPLIED);

    if (!isMarkedFinal) {

        return;
    }   
    else if (
        !getMetadataFootPrintByKey(propMeta.functionMeta, OVERRIDE_APPLIED)
    ) {

        throw new Error();
    }
}


/**
 * 
 * @param {property_metadata_t} propMeta 
 * @param {property_metadata_t} nearestPropMeta 
 * 
 * @returns {boolean}
 */
function isInnerClassConflitct(propMeta, nearestPropMeta) {


}

/**
 * 
 * @param {property_metadata_t} propMeta 
 * @param {function_variant_param_node_endpoint_metadata_t} trieEndpoint 
 * 
 * @returns {?property_metadata_t}
 */
function getNearestBaseImplementationPropMeta(propMeta, trieEndpoint) {

    const typeMeta = propMeta.owner.typeMeta;
    const _class = typeMeta.abstract;
    const depth = getMetadataFootPrintByKey(typeMeta, INHERITANCE_DEPTH);
    const overloadedName = getMetadataFootPrintByKey(propMeta, OVERLOADED_METHOD_NAME) || propMeta.name;
    
    let nearestDepth = Infinity;
    let nearestFuncMeta;
    
    for (const [genericFuncMeta, variantFuncMeta] of trieEndpoint.dispatchTable.entries()) {
        
        const t = genericFuncMeta.owner.owner.typeMeta;
        const c = t.abstract;

        const dpth = getMetadataFootPrintByKey(t, INHERITANCE_DEPTH);
        const d = depth - dpth;

        if (
            propMeta.static !== genericFuncMeta.owner.static
            || overloadedName !== genericFuncMeta.name
        ) {

            continue;
        }
        
        if (
            _class === c
        ) {

            return variantFuncMeta.owner;
        }

        if (
            d >= 0
            && d < nearestDepth
            && _class.prototype instanceof c
        ) {
            
            nearestDepth = d;
            nearestFuncMeta = variantFuncMeta;
        }
    }

    return nearestFuncMeta?.owner;
}


/**
 * 
 * @param {property_metadata_t} propMeta 
 * 
 * @returns {method_variant_mapping_table_metadata_t}
 */
function retrieveMethodVariantTableOf(propMeta) {

    return getVariantMapOf(propMeta);
}

function getVariantMapOf(propMeta) {

    const typeMeta = propMeta.owner.typeMeta;
    return propMeta.static ? typeMeta.methodVariantMaps.static : typeMeta.methodVariantMaps._prototype;
}


/**
 * @this
 * 
 * @param {string|symbol} propName 
 * @param {property_metadata_t} propMeta 
 */
function isPseudoOverloadingMethod(propName, propMeta) {

    return isOwnerOfPropMeta(this, propMeta) &&
            isPseudoMethod(propMeta) &&
            getMetadataFootPrintByKey(propMeta, OVERLOAD_APPLIED) &&
            getMetadataFootPrintByKey(propMeta.functionMeta, OVERLOAD_TARGET).name !== propMeta.name;
}

function isOverloadingMethod(propName, propMeta) {

    return isOwnerOfPropMeta.call(this, propName, propMeta) && 
            getMetadataFootPrintByKey(propMeta, OVERLOADED_METHOD_NAME);
}

/**
 * Derived overloading is when derived class define decorated methods in order 
 * to overload base class method. Base on the state of the base method, if the
 * derived method is declared to override and it's signature is the same as the base's 
 * method while the base's method allow overriden.
 * If no override declared on derived's method, it is known as overloading 
 * then now known as overriding.
 * 
 * @this 
 * 
 * @param {property_metadata_t} propMeta 
 */
function isDerivedOverloadingMethod(propName, propMeta) {

    return isOwnerOfPropMeta.call(this, propName, propMeta);
}

/**
 * @this
 * 
 * @param {object|Function} targetOfResolution 
 * @param {property_metadata_t} propMeta 
 */
function isOverrideWithoutDecoration(propName, propMeta) {

    return !isOwnerOfPropMeta.call(this, propName, propMeta) &&
            this[propName] !== getMetadataFootPrintByKey(propMeta, DECORATED_VALUE);
}

/**
 * @this
 * 
 * @param {object|Function} targetOfResolution 
 * @param {property_metadata_t} propMeta 
 */
function isOwnerOfPropMeta(propName, propMeta) {

    const propMetaOwnerClass = propMeta.owner.typeMeta.abstract;
    
    return  isObjectLike(this) &&
            (propMetaOwnerClass === this ||
            propMetaOwnerClass === this.constructor);
}

/**
 * Decide a how derieved classes inherits its base class method variant maps
 * 
 * @param {metadata_t} typeMeta 
 */
function manipulateMethodVariantsStatisticTables(typeMeta) {

    const isDerivedWithoutDecoration = !isValuable(getMetadataFootPrintByKey(typeMeta, DECORATOR_APPLIED));
    
    if (isDerivedWithoutDecoration) {
        
        return;
    }
    
    const _class = this;

    const baseClass = Object.getPrototypeOf(_class);
    const baseTypeMeta = metaOf(baseClass);

    /**@type {method_variant_map_metadata_t} */
    const baseClassMethodVariantMaps = baseTypeMeta?.methodVariantMaps;
    const currentClassMeta = typeMeta;//metaOf(_class);
    /**@type {method_variant_map_metadata_t} */
    const currentClassMethodVariantMaps = currentClassMeta.methodVariantMaps = new method_variant_map_metadata_t();

    /**
     * initialize parameter types statistical table 
     */
    currentClassMethodVariantMaps._prototype.statisticTable = new Map(baseClassMethodVariantMaps?._prototype?.statisticTable?.entries());
    currentClassMethodVariantMaps.static.statisticTable = new Map(baseClassMethodVariantMaps?.static?.statisticTable?.entries());

    if (isFirstClass(_class)) {

        currentClassMethodVariantMaps._prototype.mappingTable = new Map();
        currentClassMethodVariantMaps.static.mappingTable = new Map();

        return;
    }
    /**
     * will optimize the following lines
     */
    currentClassMethodVariantMaps._prototype.mappingTable = new Map(baseClassMethodVariantMaps?._prototype?.mappingTable?.entries());
    currentClassMethodVariantMaps.static.mappingTable = new Map(baseClassMethodVariantMaps?.static?.mappingTable?.entries());
}