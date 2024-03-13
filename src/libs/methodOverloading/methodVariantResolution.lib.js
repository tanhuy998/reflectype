const { 
    property_metadata_t, 
    function_variant_param_node_metadata_t, 
    function_variant_param_node_endpoint_metadata_t, 
    method_variant_map_metadata_t, 
    metaOf, 
    metadata_t, 
    method_variant_mapping_table_metadata_t, 
    parameter_metadata_t,
    function_metadata_t
} = require("../../reflection/metadata");
const Any = require("../../type/any");
const { DECORATED_VALUE, DECORATOR_APPLIED } = require("../constant");
const { getMetadataFootPrintByKey } = require("../footPrint");
const { OVERLOAD_APPLIED, OVERLOAD_TARGET, OVERRIDE_APPLIED, OVERLOADED_METHOD_NAME, NULLABLE } = require("./constant");
const { isObjectLike, isFirstClass, isObjectKey, isValuable } = require("../type");
const {getAllParametersMeta, getAllParametersMetaWithNullableFilter} = require('../functionParam.lib');
const { searchForMethodVariant, mergeFuncVariant } = require("./methodVariantTrieOperation.lib");
const { dispatchMethodVariant } = require("./methodVariant.lib");
const {FUNC_TRIE} = require('../metadata/registry/function.reg');
const { LEGACY_PROP_META, INHERITANCE_DEPTH } = require("../metadata/constant");
const { isPseudoMethod } = require("./pseudoMethod.lib");
const MethodDuplicateDeclarationError = require("./error/methodDuplicateDeclarationError");
const OverridingNonVirtualMethodError = require("./error/overridingNonVirtualMethodError");
const AmbigousSignatureConflictError = require("./error/ambigousSignatureConfilictError");
const debug = require('debug')('pkg:methodOverloading:resolution');

const IS_ENTRY_POINT = '_is_entry_point';

module.exports = {
    manipulateMethodVariantBehavior,
    manipulateMethodVariantsStatisticTables,
    isOwnerOfPropMeta,
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

        registerMethodVariantEntryMeta(propMeta);
    }

    const isOverloading = isOverloadingMethod.call(this, propName, propMeta);
    const hasLegacy = isOverridingBaseClassMethod.call(this, propName, propMeta);

    if (
        !isOverloading &&
        !hasLegacy
    ) {

        return;
    }

    const ctxGenericPropMeta = retrieveContextGenericPropMeta.call(this, propName, propMeta);

    let statisticTable;

    if (hasLegacy) {
        /**
         * in this case, the remote propMeta is known as the legacy
         * of the current propMeta which is placed in base class.
         */
        createContextEntryPoint(propMeta);
        statisticTable = retrieveMethodVariantTableOf(propMeta).statisticTable;
    }

    /**
     * remotePropMeta could be on base class therefore when registering remotePropMeta,
     * update the state of 
     */
    registerOverloadVariant(ctxGenericPropMeta, getAllParametersMeta(ctxGenericPropMeta.functionMeta), [statisticTable]);
    registerIfNullableBranch(ctxGenericPropMeta, getAllParametersMetaWithNullableFilter(ctxGenericPropMeta.functionMeta), [statisticTable]);
    registerOverloadVariant(propMeta, getAllParametersMeta(propMeta.functionMeta));
    registerIfNullableBranch(propMeta, getAllParametersMetaWithNullableFilter(propMeta.functionMeta));
    createContextEntryPoint(ctxGenericPropMeta);
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
function registerMethodVariantEntryMeta(propMeta) {

    const variantMaps = propMeta.owner.typeMeta.methodVariantMaps;
    const mappingTable = propMeta.static ? variantMaps.static.mappingTable : variantMaps._prototype.mappingTable;
    
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
    const mappedPropMeta = map.mappingTable.get(methodName);

    if (!mappedPropMeta) {

        return;
    }

    if (isVariantEntryPointFunction(entryPointTarget[methodName])) {

        return;
    }

    entryPointTarget[methodName] = generateEntryPointForMethodVariants(mappedPropMeta);
}

/**
 * 
 * @param {property_metadata_t} originPropMeta 
 */
function generateEntryPointForMethodVariants(originPropMeta) {
    
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
 * This function will be register as a metadata properties resoulution plugin,
 * 
 * @this Function|Object class or class's prototype that is resolved resolution
 * 
 * @param {string|symbol} propName 
 * @param {property_metadata_t} propMeta 
 */
function manipulatePseudoOveloading(propName, propMeta) {
    /**
     * pseudo memthod overload just valid when the target of overlooad is setted up,
     * init variant trie for it's target method is not necessary.
     */
    registerOverloadVariant(propMeta, this);
}

/**
 * 
 * @param {property_metadata_t} hostPropMeta 
 * @param {Array<parameter_metadata_t>} paramMetaList 
 * @param {Array<Map<Function, Number>>} extraStatisticTables
 */
function registerIfNullableBranch(hostPropMeta, paramMetaList, extraStatisticTables = []) {

    if (paramMetaList === null) {

        return;
    }

    registerOverloadVariant(hostPropMeta, paramMetaList, extraStatisticTables, true);
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
 * @returns {function_variant_param_node_metadata_t}
 */
function registerOverloadVariant(hostPropMeta, paramMetaList, extraStatisticTables = [], nullableBranch = false) {
    
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
    
    const vTable = endPointNode.endpoint.vTable;

    const genericPropMeta = retrieveGenericPropMetaOf(hostPropMeta);
    const genericFuncMeta = genericPropMeta.functionMeta;
    
    const hasImplemetantion = vTable.has(genericFuncMeta);
    const genericImplementation = vTable.get(genericFuncMeta);
    
    if (
        hasImplemetantion
        && genericImplementation === hostPropMeta//genericFuncMeta
    ) {

        return;
    }
    
    if (
        nullableBranch
    ) {

        validateNullableBranch(hostFuncMeta, genericImplementation, endPointNode);
    }
    else if (
        !nullableBranch
    ) {

        validateWithBaseClassImplemetation(hostPropMeta)
    }
    
    vTable.set(genericFuncMeta, hostFuncMeta);
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

function registerNullableVariant() {


}

/**
 * @param {function_metadata_t} funcMeta
 * @param {function_metadata_t} genericImplementation 
 * @param {function_variant_param_node_metadata_t} endpointNode
 */
function validateNullableBranch(funcMeta, genericImplementation, endpointNode) {

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
    const variantMap = propMeta.static ? typeMeta.methodVariantMaps.static : typeMeta.methodVariantMaps._prototype;
    const genericMethodName = getMetadataFootPrintByKey(propMeta, OVERLOADED_METHOD_NAME) || propMeta.name;

    return variantMap.mappingTable.get(genericMethodName);
}

/**
 * 
 * @param {property_metadata_t} propMeta 
 */
function validateWithBaseClassImplemetation(propMeta, nullable = false) {
    
    const hostFuncMeta = propMeta.functionMeta;
    const deicdeToOverrideBaseImplementation = getMetadataFootPrintByKey(propMeta, OVERRIDE_APPLIED);
    const hostParamMetaList = getAllParametersMeta(hostFuncMeta);
    const searchedNodeEndpoint = searchForMethodVariant(FUNC_TRIE, hostParamMetaList, paramMeta => paramMeta?.type || Any);
    
    if (!searchedNodeEndpoint) {

        return;
    }

    const nearestBaseImplementation = getNearestBaseImplementationPropMeta(propMeta, searchedNodeEndpoint)

    if (
        deicdeToOverrideBaseImplementation
        && !nearestBaseImplementation
    ) {
        
        throw ReferenceError();
    }
    
    if (
        !nearestBaseImplementation
    ) {

        return;
    }

    if (
        nearestBaseImplementation.owner === propMeta.owner
    ) {
        
        throw new MethodDuplicateDeclarationError(propMeta);
    }

    if (
        !nearestBaseImplementation.functionMeta.allowOverride
    ) {

        throw new OverridingNonVirtualMethodError(propMeta, nearestBaseImplementation);
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
    const overloadedName = getMetadataFootPrintByKey(propMeta, OVERLOADED_METHOD_NAME);
    
    let nearestDepth = Infinity;
    let nearestFuncMeta;

    for (const [genericFuncMeta, variantFuncMeta] of trieEndpoint.vTable.entries()) {
        
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

    // console.log(currentClassMethodVariantMaps._prototype === baseClassMethodVariantMaps._prototype)
    currentClassMethodVariantMaps._prototype.mappingTable = new Map(Array.from(baseClassMethodVariantMaps._prototype.mappingTable.entries()));
    currentClassMethodVariantMaps.static.mappingTable = new Map(Array.from(baseClassMethodVariantMaps.static.mappingTable.entries()));

    currentClassMethodVariantMaps._prototype.localTrie = baseClassMethodVariantMaps._prototype.localTrie;
    currentClassMethodVariantMaps.static.localTrie = baseClassMethodVariantMaps.static.localTrie;
}