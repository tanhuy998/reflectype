const { function_metadata_t } = require("../../../reflection/metadata");
const { Any } = require("../../../type");
const { getMetadataFootPrintByKey } = require("../../footPrint");
const { getAllParametersMeta } = require("../../functionParam.lib");
const { isAbstract } = require("../../type");
const { OVERLOADED_METHOD_NAME } = require("../constant");

module.exports = {
    stringifySignatureOf,
    stringifyFullyQualifiedFuncName,
}

/**
 * 
 * @param {function_metadata_t} functionMeta 
 * @returns {string}
 */
function stringifySignatureOf(functionMeta) {

    return getAllParametersMeta(functionMeta).map(meta => `${(meta?.type || Any).name}${meta?.allowNull ? '?' : ''}`).join(', ');
}

/**
 * 
 * @param {function_metadata_t} funcMeta 
 * 
 * @returns {string}
 */
function stringifyFullyQualifiedFuncName(funcMeta) {

    const propMeta = funcMeta.owner
    const _class = propMeta.owner.typeMeta.abstract;
    const methodName = getMetadataFootPrintByKey(propMeta, OVERLOADED_METHOD_NAME) || propMeta.name;
    const signature = stringifySignatureOf(funcMeta);
    const returnType = funcMeta.owner.type;
    const returnNullable = funcMeta.owner.allowNull;
    const type = isAbstract(returnType) ? ` (${returnType.name}${returnNullable? '?' : ''}) ` : ' ';

    return `${propMeta.static?'static ': ''}method${type}[${_class?.name || _class}].${methodName}(${signature})`;
}