const { property_metadata_t, function_metadata_t, function_variant_param_node_metadata_t, parameter_metadata_t, function_variant_origin_map_metadata_t } = require("../reflection/metadata");
const Any = require("../type/any");
const { pseudo_parameter_decorator_context_t } = require("../utils/pseudoDecorator");
const { DECORATED_VALUE } = require("./constant");
const { getMetadataFootPrintByKey, setMetadataFootPrint, metadataHasFootPrint } = require("./footPrint");
const { getParamMetaByIndex, getAllParametersMeta } = require("./functionParam.lib");
const { currentPropMeta } = require("./metadata/metadataTrace");
const { LAST_TRIE_NODE, OVERLOAD_APPLIED, OVERLOAD_TARGET } = require("./methodOverloading/constant");
const { isValuable, isObjectLike } = require("./type");

module.exports = {
    locateNewFuncVariantTrieNode,
    //initOverloadedMethodPropeMeta,
    searchForMethodVariant,
    mergeFuncVariant,
    manipulateMethodVariant,
    manipulateIfOveloading,
    manipulateMethodVariantBehavior,
}

/**
 * @this Function|Object class or class's prototype that is resolved resolution
 * 
 * @param {string|symbol} propName 
 * @param {property_metadata_t} propMeta 
 * 
 * @returns {function_variant_param_node_metadata_t}
 */
function manipulateMethodVariant(propName, propMeta) {

    if (!propMeta.isMethod) {

        return;
    }

    const typeMeta = propMeta.owner.typeMeta;
    const funcMeta = propMeta.functionMeta;
    const targetVariantMap = propMeta.static ? typeMeta.methodVariantMaps.static : typeMeta.methodVariantMaps._prototype;

    initVariantMapFor(propName, targetVariantMap);
    const variantTrie = targetVariantMap.get(propName);
    const paramMetaList = getAllParametersMeta(funcMeta);    

    if (hasVariant(variantTrie, paramMetaList)) {

        throw new ReferenceError('');
    }

    return mergeFuncVariant(paramMetaList, variantTrie);
}

/**
 * This function will be register as a metadata properties resoulution plugin,
 * 
 * @this Function|Object class or class's prototype that is resolved resolution
 * 
 * @param {string|symbol} propName 
 * @param {property_metadata_t} propMeta 
 */
function manipulateInternalOveloading(propName, propMeta) {

    if (!propMeta.isMethod) {

        return;
    }

    if (!isInternalOverloadingMethod(this, propMeta)) {

        return;
    }

    const remotePropMeta = getMetadataFootPrintByKey(propMeta.functionMeta, OVERLOAD_TARGET);

    if (!remotePropMeta) {

        return;
    }

    /**@type {function_variant_param_node_metadata_t} */
    const trieEndpoint =  manipulateMethodVariant.call(this, propName, remotePropMeta);
    const typeMeta = propMeta.owner.typeMeta;

    trieEndpoint.functionVariant.map.set(typeMeta, getMetadataFootPrintByKey(propMeta, DECORATED_VALUE));
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

    if (isInternalOverloadingMethod.call(this, propMeta)) {

        manipulateInternalOveloading(propName, propMeta);
        return;
    }
    
    if (isDerivedOverloadingMethod.call(this, propMeta)) {

        return;
    }

    //if ()
}

/**
 * 
 * @param {string|symbol} propName 
 * @param {property_metadata_t} propMeta 
 */
function manipulateDerivedOverloading(propName, propMeta) {


}

function isDerivedOverrideMethod() {


}

/**
 * @this 
 * 
 * @param {property_metadata_t} propMeta 
 */
function isDerivedOverloadingMethod(propMeta) {

    const methodName = propMeta.name;

    if (
        !isOwnerOfPropMeta(this, propMeta) &&
        typeof this[methodName] === 'function' &&
        !getMetadataFootPrintByKey(propMeta, OVERLOAD_APPLIED)
    ) {

        return true;
    }

    if (
        isOwnerOfPropMeta(this, propMeta)
    ) {

        const variantMaps = propMeta.owner.typeMeta.methodVariantMaps;
        const targetVariantMap = propMeta.static ? variantMaps.static : variantMaps._prototype;


    }
}

/**
 * @this
 * 
 * @param {property_metadata_t} propMeta 
 */
function isInternalOverloadingMethod(propMeta) {

    return  isOwnerOfPropMeta(this, propMeta) &&
            getMetadataFootPrintByKey(propMeta, OVERLOAD_APPLIED);
}

/**
 * 
 * @param {object|Function} targetOfResolution 
 * @param {property_metadata_t} propMeta 
 */
function isOwnerOfPropMeta(targetOfResolution, propMeta) {

    const propMetaOwnerClass = propMeta.owner.typeMeta.abstract;

    return  !isObjectLike(targetOfResolution) &&
            (propMetaOwnerClass === _unknown ||
            propMetaOwnerClass === _unknown.prototype);
}

/**
 * 
 * @param {string|symbol} methodName 
 * @param {Map<string|symbol, function_variant_param_node_metadata_t>} variantMap 
 */
function initVariantMapFor(methodName, variantMap) {

    if (variantMap.has(methodName)) {

        return;
    }

    variantMap.set(methodName, new function_variant_param_node_metadata_t());
}

/**
 * Is called when a parameter is type hinted
 * 
 * @param {parameter_metadata_t} paramMeta 
 * @param {function_variant_param_node_metadata_t} rootTrieNode
 */
function locateNewFuncVariantTrieNode(paramMeta, rootTrieNode) {

    const paramIndex = paramMeta.index;
    const hostFuncMeta = paramMeta.owner; 
    let currentHostTrieNode = rootTrieNode;
    console.log('-----------------' , hostFuncMeta.name, paramMeta.index, paramMeta.type ,'---------------------')
    while (true) {
        console.log(['depth'], currentHostTrieNode.depth)
        console.log(1)
        if (currentHostTrieNode.depth === paramIndex) {

            manipulateNewTrieNode(paramMeta, currentHostTrieNode);
            break;
        }
        console.log(2)
        if (currentHostTrieNode.depth < paramIndex) {

            currentHostTrieNode = manipulateNewTrieNode(null, currentHostTrieNode);
            continue;
        }
        console.log(3)
        if (currentHostTrieNode.depth >= paramIndex) {

            currentHostTrieNode = manipulateNewTrieNode(paramMeta, currentHostTrieNode);
            continue;
        }
    }

    return currentHostTrieNode;
    //console.log(hostFuncMeta.variantTrie)
}

/**
 * 
 * @param {parameter_metadata_t?} paramMeta 
 * @param {function_variant_param_node_metadata_t} hostTrieNode 
 * 
 * @returns {function_variant_param_node_metadata_t}
 */
function manipulateNewTrieNode(paramMeta, hostTrieNode) {

    const paramType = paramMeta?.type ?? Any;

    if (
        hostTrieNode.current.has(paramType) &&
        paramType !== Any
    ) {

        throw new ReferenceError();
    }
    else if (
        hostTrieNode.current.has(paramType) &&
        paramType === Any
    ) { 
        /**
         * when there is no type and the current depth also
         * 
         */
        return hostTrieNode.current.get(paramType);
    }

    const newHostTrieNode = new function_variant_param_node_metadata_t(hostTrieNode);
    hostTrieNode.current.set(paramType, newHostTrieNode);
    console.log([3], hostTrieNode)
    return newHostTrieNode;
}

/**
 * 
 * @param {Array<parameter_metadata_t>} paramMetaList 
 * @param {function_metadata_t} rootTrieNode 
 * 
 * @returns {function_variant_param_node_metadata_t}
 */
function mergeFuncVariant(paramMetaList, rootTrieNode) {

    if (hasVariant(rootTrieNode, paramTypeList)) {

        throw new Error(); // will be a custom error
    }

    let ret;

    for (const paramMeta of paramMetaList || []) {

        ret = locateNewFuncVariantTrieNode(paramMeta, rootTrieNode);
    }

    return ret;
}

/**
 * 
 * @param {function_metadata_t} funcMeta 
 * @param {Array<parameter_metadata_t>} paramTypeList 
 * @returns 
 */
function hasVariant(rootTrieNode, paramTypeList) {

    return typeof searchForMethodVariant(
        rootTrieNode, paramTypeList, 
        (paramMeta) => {
            return paramMeta.type;
        }
    ) === function_variant_origin_map_metadata_t;
}

/**
 * 
 * @param {function_variant_param_node_metadata_t} rootTrieNode
 * @param {Array<any>} list 
 * @param {Function} transform 
 */
function searchForMethodVariant(rootTrieNode, list, transform) {

    const iterator = (list || [])[Symbol.iterator]();
    let iteration = iterator.next();
    let currentNode = rootTrieNode;
    console.log('======================================')
    while (
        !iteration.done
    ) {

        const _type = typeof transform === 'function' ? transform(iteration.value) : iteration.value;
        console.log(_type, currentNode)
        if (!currentNode.current.has(_type)) {

            return undefined;
        }

        currentNode = currentNode.current.get(_type);
        iteration = iterator.next();
    }

    return currentNode?.functionVariant;
}
