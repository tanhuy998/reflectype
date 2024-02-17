const MetadataAspect = require("../../metadata/aspect/metadataAspect");
const { property_metadata_t, function_metadata_t, function_variant_param_node_metadata_t, parameter_metadata_t, function_variant_param_node_endpoint_metadata_t } = require("../../reflection/metadata");
const Any = require("../../type/any");
const { DECORATED_VALUE } = require("../constant");
const { getMetadataFootPrintByKey } = require("../footPrint");
const { OVERLOAD_APPLIED, OVERLOAD_TARGET, OVERRIDE_APPLIED } = require("./constant");
const { isObjectLike } = require("../type");
const {getAllParametersMeta} = require('../functionParam.lib');
const { locateNewFuncVariantTrieNode, searchForMethodVariant, hasVariant, mergeFuncVariant } = require("./methodVariantTrieOperation.lib");
const { dispatchMethodVariant } = require("./methodVariant.lib");

const IS_ENTRY_POINT = '_is_entry_point';

module.exports = {
    manipulateMethodVariantBehavior,
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

    if (
        isVariantEntryPointFunction(this[propName])
    ) {

        return;
    }

    this[remotePropMeta.name] = generateEntryPointForMethodVariants(remotePropMeta);
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
    const overloadedMethodName = getMetadataFootPrintByKey(hostFuncMeta, OVERLOAD_TARGET)?.name || hostPropMeta.name;
    const isPseudoMethod = overloadedMethodName === hostPropMeta.name;

    const typeMeta = hostPropMeta.owner.typeMeta;
    const maps = typeMeta.methodVariantMaps;
    const variantMappingTable = hostPropMeta.static ? maps.static : maps._prototype;
    const variantMap = variantMappingTable.mappingTable;
    
    const variantTrie = variantMap.get(overloadedMethodName) || initIfNoVariantMap(hostPropMeta.name, variantMap);
    const hostParamMetaList = getAllParametersMeta(hostFuncMeta);

    const searchedNodeEndpoint = searchForMethodVariant(variantTrie, hostParamMetaList, paramMeta => paramMeta?.type || Any);

    const hasSignature = searchedNodeEndpoint?.vTable.has(typeMeta);
    //console.log(['signature existence check'], hasSignature)
    const overloadedFuncMeta = searchedNodeEndpoint?.vTable.get(typeMeta);

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

    const endPointNode = mergeFuncVariant(hostParamMetaList, variantTrie, variantMappingTable.statisticTable);
    
    endPointNode.endpoint ??= new function_variant_param_node_endpoint_metadata_t();
    endPointNode.endpoint.vTable.set(typeMeta, getMetadataFootPrintByKey(hostPropMeta, DECORATED_VALUE));
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