const { 
    function_metadata_t,
    function_variant_param_node_metadata_t, 
} = require("../../reflection/metadata");


module.exports = {
    extractVirtualFunction
}

/**
 * 
 * vPtr is the casted
 * 
 * @param {function_metadata_t} genericImplementation 
 * @param {Function} vPtr
 * @param {Function} actualType
 * 
 * @returns {function_metadata_t}
 */
function extractVirtualFunction(
    genericImplementation,
    vPtr,
    actualType
) {
    
    if (
        typeof genericImplementation !== 'object'
        || !genericImplementation.isVirtual
    ) {

        return undefined;
    }

    let _class = actualType;
    vPtr ||= actualType;

    while (
        genericImplementation.vTable.size > 0
        && _class !== vPtr
    ) {

        const overrideImplementation = genericImplementation.vTable.get(_class);

        if (typeof overrideImplementation === 'object') {
            
            return overrideImplementation;
        }

        _class = Object.getPrototypeOf(_class);
    }

    return genericImplementation;
}

function lookupVirtualImplementation() {

    
}