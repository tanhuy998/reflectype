const { property_metadata_t, function_metadata_t, function_variant_param_node_metadata_t, parameter_metadata_t, function_variant_origin_map_metadata_t } = require("../reflection/metadata");
const Any = require("../type/any");
const { DECORATED_VALUE } = require("./constant");
const { getMetadataFootPrintByKey } = require("./footPrint");
const { OVERLOAD_APPLIED, OVERLOAD_TARGET } = require("./methodOverloading/constant");
const { isObjectLike } = require("./type");

module.exports = {
    locateNewFuncVariantTrieNode,
    //initOverloadedMethodPropeMeta,
    searchForMethodVariant,
    mergeFuncVariant,
    manipulateMethodVariantBehavior,
    isOwnerOfPropMeta,
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
function manipulatePseudoOveloading(propName, propMeta) {

    if (!propMeta.isMethod) {

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
function manipulateDerivedOverloading(propName, propMeta) {


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

    if (isPseudoOverloadingMethod.call(this, propName, propMeta)) {

        manipulatePseudoOveloading(propName, propMeta);
        return;
    }
    
    if (isDerivedOverloadingMethod.call(this, propName, propMeta)) {

        manipulateDerivedOverloading.call(this, propName, propMeta);
        return;
    }

    //if ()
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
 * @this
 * 
 * @param {string|symbol} propName 
 * @param {property_metadata_t} propMeta 
 */
function isDerivedOverrideMethod(propName, propMeta) {


}

/**
 * @this 
 * 
 * @param {property_metadata_t} propMeta 
 */
function isDerivedOverloadingMethod(propName, propMeta) {

    
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
            propMetaOwnerClass === this.prototype);
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

    if (hasVariant(rootTrieNode, paramMetaList)) {

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
