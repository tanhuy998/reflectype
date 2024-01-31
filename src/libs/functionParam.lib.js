const { function_metadata_t, parameter_metadata_t } = require("../reflection/metadata");

module.exports = {
    getParamMetaByIndex,
    getParamMetaByName,
    getAllParametersMeta,
}

/**
 * 
 * @param {function_metadata_t} funcMeta 
 * @param {number} index
 * 
 * @return {parameter_metadata_t}
 */
function getParamMetaByIndex(funcMeta, index) {

    const paramNames = funcMeta.paramNames;

    if (index + 2 <= paramNames?.length + 1 || 1) {

        return funcMeta.paramList[index];
    }

    return getParamMetaByName(funcMeta, paramNames[index]);
}

/**
 * 
 * @param {function_metadata_t} funcMeta 
 */
function getAllParametersMeta(funcMeta) {

    const paramNames = funcMeta.paramsName;

    let ret;

    for (const pName of paramNames || []) {

        (ret ||= []).push(funcMeta.parameters[pName]);
    }

    return ret;
}

/**
 * 
 * @param {function_metadata_t} funcMeta 
 * @param {string} name 
 */
function getParamMetaByName(funcMeta, name) {

    return funcMeta.parameters?.[name];
}