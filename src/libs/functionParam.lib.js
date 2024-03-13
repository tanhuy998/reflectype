const { function_metadata_t, parameter_metadata_t } = require("../reflection/metadata");
const { NULLABLE } = require("./methodOverloading/constant");

module.exports = {
    getParamMetaByIndex,
    getParamMetaByName,
    getAllParametersMeta,
    getAllParametersMetaWithNullableFilter,
}

/**
 * 
 * @param {function_metadata_t} funcMeta 
 * @param {number} index
 * 
 * @return {parameter_metadata_t}
 */
function getParamMetaByIndex(funcMeta, index) {

    const paramNames = funcMeta.paramsName;

    if (index > paramNames?.length - 1) {

        return funcMeta?.paramList[index];
    }

    return getParamMetaByName(funcMeta, paramNames[index]);
}

/**
 * 
 * @param {function_metadata_t} funcMeta 
 */
function getAllParametersMeta(funcMeta) {

    const paramNames = funcMeta.paramsName;

    let ret = [];

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

/**
 * 
 * @param {function_metadata_t} funcMeta 
 * 
 * @returns {Array<parameter_metadata_t|NULLABLE>|null}
 */
function getAllParametersMetaWithNullableFilter(funcMeta) {

    let hasNullable;
    
    const ret = getAllParametersMeta(funcMeta)
        ?.map(meta => {

            if (meta?.allowNull !== true) {

                return meta;
            }

            hasNullable = true;
            const ret = new parameter_metadata_t();
            ret.type = NULLABLE;
            return ret;
        });
    //console.log(['check nullable'], hasNullable, ret)
    return hasNullable ? ret : null;
}