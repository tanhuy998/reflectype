const { function_metadata_t } = require("../../../reflection/metadata");
const { Any } = require("../../../type");
const { getAllParametersMeta } = require("../../functionParam.lib");

module.exports = {
    stringifySignatureOf
}

/**
 * 
 * @param {function_metadata_t} functionMeta 
 * @returns {string}
 */
function stringifySignatureOf(functionMeta) {

    return getAllParametersMeta(functionMeta).map(meta => (meta?.type || Any).name).join(', ');
}