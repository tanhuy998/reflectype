const MetadataAspect = require("../../metadata/aspect/metadataAspect");
const { property_metadata_t, function_metadata_t, function_variant_param_node_metadata_t, parameter_metadata_t, function_variant_param_node_endpoint_metadata_t, method_variant_map_metadata_t, metaOf, metadata_t } = require("../../reflection/metadata");
const Any = require("../../type/any");
const { DECORATED_VALUE } = require("../constant");
const { getMetadataFootPrintByKey } = require("../footPrint");
const { OVERLOAD_APPLIED, OVERLOAD_TARGET, OVERRIDE_APPLIED } = require("./constant");
const { isObjectLike, isFirstClass } = require("../type");
const {getAllParametersMeta} = require('../functionParam.lib');
const { locateNewFuncVariantTrieNode, searchForMethodVariant, hasVariant, mergeFuncVariant } = require("./methodVariantTrieOperation.lib");
const { dispatchMethodVariant } = require("./methodVariant.lib");
const {FUNC_TRIE, STATISTIC_TABLE} = require('../metadata/registry/function.reg');

const IS_ENTRY_POINT = '_is_entry_point';

module.exports = {
    manipulateMethodVariantBehavior,
    manipulateMethodVariantsStatisticTables,
    isOwnerOfPropMeta,
}

/**
 * This function will be register as a metadata properties resoulution plugin,
 * 
 * @this Function|Object class or class's prototype that is resolved resolution
 * 
 * @param {string|symbol} propName 
 * @param {property_metadata_t} propMeta 
 */
function manipulateMethodVariantBehavior(propName, propMeta) {

    if (!propMeta.isMethod) {

        return;
    }

    if (isOverrideWithoutDecoration.call(this, propName, propMeta)) {
        const currentClass = typeof this === 'function' ? this : this.constructor;
        const overridedClass = propMeta.owner.typeMeta.abstract;
        throw new ReferenceError(`could not define undecorated method [${currentClass?.name}].${propName}() to override base class's decorated method [${overridedClass?.name}].${propName}()`);
    }

    if (!isOwnerOfPropMeta.call(this, propName, propMeta)) {

        return;
    }

    if (
        isPseudoOverloadingMethod.call(this, propName, propMeta) ||
        isDerivedOverloadingMethod.call(this, propName, propMeta)
    ) {
        
        createEntryPoint.call(this, propName, propMeta);
        manipulatePseudoOveloading.call(this, propName, propMeta);
        return;
    }
}

/**
 * 
 * @this Function|Object class or class's prototype that is resolved resolution
 * 
 * @param {string|symbol} propName 
 * @param {property_metadata_t} hostPropMeta 
 */
function createEntryPoint(propName, hostPropMeta) {

    if (!hostPropMeta.isMethod) {

        return;
    }

    /**@type {property_metadata_t} */
    const remotePropMeta = getMetadataFootPrintByKey(hostPropMeta.functionMeta, OVERLOAD_TARGET);

    if (!remotePropMeta) {

        return;
    }

    const variantMaps = remotePropMeta.owner.typeMeta.methodVariantMaps;
    const map = remotePropMeta.static ? variantMaps.static : variantMaps._prototype;
    const mappedPropMeta = map.mappingTable.get(remotePropMeta.name);

    if (
        isVariantEntryPointFunction(this[remotePropMeta.name]) &&
        mappedPropMeta === remotePropMeta
    ) {

        return;
    }
    console.log([propName], this)

    /**
     *  remote on base class
     *      
     *  remote on current class
     */

    const actualMappedPropMeta = getActualMappedPropMeta.call(this, propName, hostPropMeta);

    this[remotePropMeta.name] = generateEntryPointForMethodVariants(actualMappedPropMeta);
    map.mappingTable.set(remotePropMeta.name, actualMappedPropMeta);
}

/**
 * 
 * @param {property_metadata_t} originPropMeta 
 */
function generateEntryPointForMethodVariants(originPropMeta) {

    const ENTRY_POINT = function () {
        console.log(this, originPropMeta.owner.typeMeta.abstract);
        return dispatchMethodVariant(this, originPropMeta, arguments);
    }

    markAsVariantEntryPoint(ENTRY_POINT)

    return ENTRY_POINT;
}

function getActualMappedPropMeta(propName, propMeta) {

    const remotePropMeta = getMetadataFootPrintByKey(propMeta.functionMeta, OVERLOAD_TARGET);

    return isOwnerOfPropMeta.call(this, propName, remotePropMeta) ? remotePropMeta : propMeta;
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
    registerOverloadVariant(propMeta);
}

/**
 * This function will be register as a metadata properties resoulution plugin,
 * 
 * @this Function|Object class or class's prototype that is resolved resolution
 * 
 * @param {string|symbol} propName 
 * @param {property_metadata_t} propMeta 
 */
function manipulateDerivedOverloading(propName, propMeta) {


}

/**
 * 
 * @param {*} methodName 
 * @param {Map} variantMap 
 * @returns 
 */
function initIfNoVariantMap(methodName, variantMap) {

    if (variantMap.has(methodName)) {

        return;
    }

    return variantMap.set(methodName, new function_variant_param_node_metadata_t())
                    .get(methodName);
}

/**
 * Get paramMeta list of hostPropMeta register for new method variant of remotePropMeta
 * 
 * 
 * @param {property_metadata_t} hostPropMeta 
 * @param {property_metadata_t} remotePropMeta 
 * 
 * @returns {function_variant_param_node_metadata_t}
 */
function registerOverloadVariant(hostPropMeta) {

    const hostFuncMeta = hostPropMeta.functionMeta;
    
    const remotePropMeta = getMetadataFootPrintByKey(hostFuncMeta, OVERLOAD_TARGET) || hostPropMeta;
    const overloadedMethodName = remotePropMeta?.name || hostPropMeta.name;
    const isPseudoMethod = overloadedMethodName === hostPropMeta.name;

    const typeMeta = hostPropMeta.owner.typeMeta;
    const maps = typeMeta.methodVariantMaps;
    const variantMappingTable = hostPropMeta.static ? maps.static : maps._prototype;
    const variantMap = variantMappingTable.mappingTable;
    
    //const variantTrie = variantMap.get(overloadedMethodName) || initIfNoVariantMap(hostPropMeta.name, variantMap);

    const variantTrie = FUNC_TRIE;
    const hostParamMetaList = getAllParametersMeta(hostFuncMeta);

    const searchedNodeEndpoint = searchForMethodVariant(variantTrie, hostParamMetaList, paramMeta => paramMeta?.type || Any);

    //const hasSignature = searchedNodeEndpoint?.vTable.has(typeMeta);
    //console.log(['signature existence check'], hasSignature)
    //const overloadedFuncMeta = searchedNodeEndpoint?.vTable.get(typeMeta);
    const hasSignature = searchedNodeEndpoint?.vTable.has(remotePropMeta.functionMeta);
    const overloadedFuncMeta = searchedNodeEndpoint?.vTable.get(remotePropMeta.functionMeta);

    if (
        hasSignature && 
        (
            //isPseudoMethod ||
            !overloadedFuncMeta.allowOverride
        )
    ) {
        /**
         *  the current signature is mapped to a variant but it did not allow to be override
         */
        throw new ReferenceError(`could not overload method variant that is deifned before, check for @override state`);
    }

    const hostDecideToOverride = getMetadataFootPrintByKey(hostPropMeta, OVERRIDE_APPLIED);

    if (
        !hasSignature &&
        hostDecideToOverride
    ) {
        /**
         * derived class wants to override inexisted base class's method
         */
        throw new ReferenceError(`derived class decided to override base class's but there is no variant for the method signature`);
    }

    if (
        hasSignature &&
        overloadedFuncMeta.allowOverride
    ) {
        /**
         * when derived class override base class with allowance.
         */
        searchedNodeEndpoint.vTable.set(typeMeta, hostPropMeta.functionMeta);
        return;
    }

    /**
     * last case: the current signature is not mapped to any funcMeta
     */
    // const endPointNode = mergeFuncVariant(hostParamMetaList, variantTrie, variantMappingTable.statisticTable);
    const endPointNode = mergeFuncVariant(
        hostParamMetaList, 
        variantTrie, 
        variantMappingTable.statisticTable, 
        // remotePropMeta.functionMeta, 
        // hostFuncMeta
    );
    
    //endPointNode.endpoint ??= new function_variant_param_node_endpoint_metadata_t();
    //endPointNode.endpoint.vTable.set(typeMeta, getMetadataFootPrintByKey(hostPropMeta, DECORATED_VALUE));
    //endPointNode.endpoint.vTable.set(typeMeta, hostPropMeta.functionMeta);
    const mappedPropMeta = getActualMappedPropMeta.call(this, remotePropMeta.name, hostPropMeta);
    //endPointNode.endpoint.vTable.set(remotePropMeta.functionMeta, hostFuncMeta);
    endPointNode.endpoint.vTable.set(mappedPropMeta.functionMeta, hostFuncMeta);
}

/**
 * 
 * @param {property_metadata_t} propMeta 
 * 
 * @returns {function_variant_param_node_metadata_t}
 */
function getVariantTrieOf(propMeta) {

    const variantMap = getVariantMapOf(propMeta);

    return variantMap.get(propMeta.name)
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
            getMetadataFootPrintByKey(propMeta, OVERLOAD_APPLIED) &&
            getMetadataFootPrintByKey(propMeta.functionMeta, OVERLOAD_TARGET).name !== propMeta.name;
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
 * 
 * @param {metadata_t} typeMeta 
 */
function manipulateMethodVariantsStatisticTables(typeMeta) {

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
}