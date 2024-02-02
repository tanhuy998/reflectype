const MetadataAspect = require("../metadata/aspect/metadataAspect");
const { property_metadata_t, function_metadata_t, function_variant_param_node_metadata_t, parameter_metadata_t, function_variant_param_node_endpoint_metadata_t } = require("../reflection/metadata");
const Any = require("../type/any");
const { DECORATED_VALUE } = require("./constant");
const { getMetadataFootPrintByKey } = require("./footPrint");
const { OVERLOAD_APPLIED, OVERLOAD_TARGET, OVERRIDE_APPLIED } = require("./methodOverloading/constant");
const { isObjectLike } = require("./type");
const {getAllParametersMeta} = require('./functionParam.lib');
const { locateNewFuncVariantTrieNode, searchForMethodVariant, hasVariant, mergeFuncVariant } = require("./methodVariantTrieOperation.lib");


module.exports = {
    // locateNewFuncVariantTrieNode,
    // //initOverloadedMethodPropeMeta,
    // searchForMethodVariant,
    // mergeFuncVariant,
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
    console.log(0)
    if (!propMeta.isMethod) {

        return;
    }
    console.log(1)
    if (isOverrideWithoutDecoration.call(this, propName, propMeta)) {
        const currentClass = typeof this === 'function' ? this : this.constructor;
        const overridedClass = propMeta.owner.typeMeta.abstract;
        throw new ReferenceError(`could not define undecorated method [${currentClass?.name}].${propName}() to override base class's decorated method [${overridedClass?.name}].${propName}()`);
    }
    console.log(2)
    if (!isOwnerOfPropMeta.call(this, propName, propMeta)) {

        return;
    }
    console.log(3)
    if (
        isPseudoOverloadingMethod.call(this, propName, propMeta) ||
        isDerivedOverloadingMethod.call(this, propName, propMeta)
    ) {

        manipulatePseudoOveloading.call(this, propName, propMeta);
        return;
    }
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
    // const remotePropMeta = getMetadataFootPrintByKey(propMeta.functionMeta, OVERLOAD_TARGET);

    // if (!remotePropMeta) {

    //     throw new ReferenceError('');
    // }

    /**@type {function_variant_param_node_metadata_t} */
    // const endPointNode = registerOverloadVariant(propMeta, remotePropMeta); // manipulateMethodVariant.call(this, propName, remotePropMeta);
    // const typeMeta = propMeta.owner.typeMeta;

    // endPointNode.endpoint.map.set(typeMeta, getMetadataFootPrintByKey(propMeta, DECORATED_VALUE));

    registerOverloadVariant(propMeta); // manipulateMethodVariant.call(this, propName, remotePropMeta);
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

    // const variantTrie = getVariantTrieOf(remotePropMeta);

    const overloadedMethodName = getMetadataFootPrintByKey(hostPropMeta, OVERLOAD_TARGET)?.name || hostPropMeta.name;
    const isPseudoMethod = overloadedMethodName === hostPropMeta.name;

    const hostFuncMeta = hostPropMeta.functionMeta;
    const typeMeta = hostPropMeta.owner.typeMeta;
    const maps = typeMeta.methodVariantMaps;
    const variantMap = hostPropMeta.static ? maps.static : maps._prototype;

    const variantTrie = variantMap.get(overloadedMethodName) || initIfNoVariantMap(hostPropMeta.name, variantMap);
    const hostParamMetaList = getAllParametersMeta(hostFuncMeta);

    //const remoteAllowOverride = remotePropMeta.functionMeta.allowOverride;
    const searchedNodeEndpoint = searchForMethodVariant(variantTrie, hostParamMetaList, paramMeta => paramMeta.type);

    const hasSignature = searchedNodeEndpoint?.map.has(typeMeta);  //hasVariant(variantTrie, hostParamMetaList);
    const overloadedFuncMeta = searchedNodeEndpoint?.map.get(typeMeta);

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
        searchedNodeEndpoint.map.set(typeMeta, hostPropMeta.functionMeta);
        return;
    }

    /**
     * last case: the current signature is not mapped to any funcMeta
     */

    const endPointNode = mergeFuncVariant(hostParamMetaList, variantTrie);

    endPointNode.endpoint.map.set(typeMeta, getMetadataFootPrintByKey(hostPropMeta, DECORATED_VALUE));
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


// /**
//  * @this
//  * 
//  * @param {string|symbol} propName 
//  * @param {property_metadata_t} propMeta 
//  */
// function isDerivedOverrideMethod(propName, propMeta) {


// }

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


// /**
//  * Is called when a parameter is type hinted
//  * 
//  * @param {parameter_metadata_t} paramMeta 
//  * @param {function_variant_param_node_metadata_t} rootTrieNode
//  */
// function locateNewFuncVariantTrieNode(paramMeta, rootTrieNode) {

//     const paramIndex = paramMeta.index;
//     const hostFuncMeta = paramMeta.owner; 
//     let currentHostTrieNode = rootTrieNode;
//     console.log('-----------------' , hostFuncMeta.name, paramMeta.index, paramMeta.type ,'---------------------')
//     while (true) {
//         console.log(['depth'], currentHostTrieNode.depth)
//         console.log(1)
//         if (currentHostTrieNode.depth === paramIndex) {

//             manipulateNewTrieNode(paramMeta, currentHostTrieNode);
//             break;
//         }
//         console.log(2)
//         if (currentHostTrieNode.depth < paramIndex) {

//             currentHostTrieNode = manipulateNewTrieNode(null, currentHostTrieNode);
//             continue;
//         }
//         console.log(3)
//         if (currentHostTrieNode.depth >= paramIndex) {

//             currentHostTrieNode = manipulateNewTrieNode(paramMeta, currentHostTrieNode);
//             continue;
//         }
//     }

//     return currentHostTrieNode;
//     //console.log(hostFuncMeta.variantTrie)
// }

// /**
//  * 
//  * @param {parameter_metadata_t?} paramMeta 
//  * @param {function_variant_param_node_metadata_t} hostTrieNode 
//  * 
//  * @returns {function_variant_param_node_metadata_t}
//  */
// function manipulateNewTrieNode(paramMeta, hostTrieNode) {

//     const paramType = paramMeta?.type ?? Any;

//     if (
//         hostTrieNode.current.has(paramType) &&
//         paramType !== Any
//     ) {

//         throw new ReferenceError();
//     }
//     else if (
//         hostTrieNode.current.has(paramType) &&
//         paramType === Any
//     ) { 
//         /**
//          * when there is no type and the current depth also
//          * 
//          */
//         return hostTrieNode.current.get(paramType);
//     }

//     const newHostTrieNode = new function_variant_param_node_metadata_t(hostTrieNode);
//     hostTrieNode.current.set(paramType, newHostTrieNode);
//     console.log([3], hostTrieNode)
//     return newHostTrieNode;
// }

// /**
//  * 
//  * @param {Array<parameter_metadata_t>} paramMetaList 
//  * @param {function_metadata_t} rootTrieNode 
//  * 
//  * @returns {function_variant_param_node_metadata_t}
//  */
// function mergeFuncVariant(paramMetaList, rootTrieNode) {

//     if (hasVariant(rootTrieNode, paramMetaList)) {

//         throw new Error(); // will be a custom error
//     }

//     let ret;

//     for (const paramMeta of paramMetaList || []) {

//         ret = locateNewFuncVariantTrieNode(paramMeta, rootTrieNode);
//     }

//     return ret;
// }

// /**
//  * 
//  * @param {function_metadata_t} funcMeta 
//  * @param {Array<parameter_metadata_t>} paramTypeList 
//  * @returns 
//  */
// function hasVariant(rootTrieNode, paramTypeList) {

//     return typeof searchForMethodVariant(
//         rootTrieNode, paramTypeList, 
//         (paramMeta) => {
//             return paramMeta.type;
//         }
//     ) === function_variant_param_node_endpoint_metadata_t;
// }

// /**
//  * 
//  * @param {function_variant_param_node_metadata_t} rootTrieNode
//  * @param {Array<any>} list 
//  * @param {Function} transform 
//  */
// function searchForMethodVariant(rootTrieNode, list, transform) {

//     const iterator = (list || [])[Symbol.iterator]();
//     let iteration = iterator.next();
//     let currentNode = rootTrieNode;
//     console.log('======================================')
//     while (
//         !iteration.done
//     ) {

//         const _type = typeof transform === 'function' ? transform(iteration.value) : iteration.value;
//         console.log(_type, currentNode)
//         if (!currentNode.current.has(_type)) {

//             return undefined;
//         }

//         currentNode = currentNode.current.get(_type);
//         iteration = iterator.next();
//     }

//     return currentNode?.endpoint;
// }
