const { 
    property_metadata_t, 
    metaOf, 
    metadata_t, 
    function_metadata_t
} = require("../../reflection/metadata");
const Any = require("../../type/any");
const { getMetadataFootPrintByKey } = require("../footPrint");
const { OVERLOADED_METHOD_NAME } = require("./constant");
const {getAllParametersMeta, getAllParametersMetaWithNullableFilter} = require('../functionParam.lib');
const { searchForMatchTrieNode } = require("./methodVariantTrieOperation.lib");
const {FUNC_TRIE} = require('./registry/function.reg');
const Interface = require("../../interface/interface");
const InterfaceMethodNotImplementedError = require("./error/interfaceMethodNotImplementedError");
const { getNearestBaseImplementationPropMeta } = require("./methodVariantResolution.lib");

module.exports = {
    verifyInterfaceImplementation,
}

/**
 * @this Function
 * 
 * @param {metadata_t} typeMeta 
 */
function verifyInterfaceImplementation(typeMeta) {
    
    if (this.prototype instanceof Interface) {

        return;
    }
    
    if (typeMeta.interfaces?.origin !== typeMeta.abstract) {

        return;
    }
    
    for (const [Intf, origin] of typeMeta.interfaces.list.entries() || [[]]) {

        if (origin !== typeMeta.abstract) {
            
            continue;
        }

        verifyInterface(typeMeta, Intf);
    }
}

/**
 * 
 * @param {metadata_t} hostTypMeta
 * @param {Interface} intf 
 */
function verifyInterface(hostTypMeta, intf) {
    /**@type {metadata_t} */
    const typeMeta = metaOf(intf);

    if (!typeMeta) {

        return;
    }
    
    const prototype = typeMeta._prototype;
    
    for (const propMeta of Object.values(prototype.properties)) {

        if (!propMeta.isMethod) {

            continue;
        }

        const targetMethodName = getMetadataFootPrintByKey(
            propMeta,
            OVERLOADED_METHOD_NAME
        ) || propMeta.name;

        const genericPropMeta =
            hostTypMeta.methodVariantMaps._prototype.mappingTable.get(targetMethodName);
        
        if (!genericPropMeta) {

            throw new InterfaceMethodNotImplementedError(hostTypMeta, propMeta);
        }

        verifyOnTrie(propMeta.functionMeta, genericPropMeta);
    }
}

/**
 * 
 * @param {function_metadata_t} interfaceFuncMeta 
 * @param {property_metadata_t} hostGenericPropMeta
 */
function verifyOnTrie(interfaceFuncMeta, hostGenericPropMeta) {

    const hostTypeMeta = hostGenericPropMeta.owner.typeMeta;
    const paramMetaList = getAllParametersMeta(interfaceFuncMeta);
    const trieEndpoint = searchForMatchTrieNode(
        FUNC_TRIE, paramMetaList, meta => meta?.type || Any
    )?.endpoint;
    const genericImplementation = trieEndpoint?.dispatchTable.get(hostGenericPropMeta.functionMeta)
            || getNearestBaseImplementationPropMeta(
                hostGenericPropMeta,
                trieEndpoint
            )?.functionMeta;

    verifyImplementation(
        hostTypeMeta, genericImplementation, interfaceFuncMeta
    );
    
    const nullableBrannch = getAllParametersMetaWithNullableFilter(interfaceFuncMeta);
    
    if (!nullableBrannch) {

        return;
    }

    const nullableEndpoint = searchForMatchTrieNode(
        FUNC_TRIE,
        nullableBrannch,
        meta => meta?.type || Any
    )?.endpoint;

    const nullableGenericImplementation = nullableEndpoint.dispatchTable.get(hostGenericPropMeta.functionMeta)
                || getNearestBaseImplementationPropMeta(
                    hostGenericPropMeta,
                    nullableEndpoint
                )?.functionMeta;

    verifyImplementation(
        hostTypeMeta, nullableGenericImplementation, interfaceFuncMeta
    );
}

/**
 * 
 * @param {metadata_t} hostTypeMeta 
 * @param {function_metadata_t} implementation 
 * @param {function_metadata_t} interfaceFuncMeta 
 */
function verifyImplementation(hostTypeMeta, implementation, interfaceFuncMeta) {
    
    if (
        !implementation
        || implementation.owner.type !== interfaceFuncMeta.owner.type
    ) {

        throw new InterfaceMethodNotImplementedError(
            hostTypeMeta, interfaceFuncMeta.owner
        )
    }
}