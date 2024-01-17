const { property_metadata_t, function_metadata_t } = require("../reflection/metadata");

module.exports = {
    reproduceReadableFunctionIndentifier
}

/**
 * 
 * @param {property_metadata_t|function_metadata_t} _meta 
 * @returns {string}
 */
function reproduceReadableFunctionIndentifier(_meta) {

    return _meta instanceof property_metadata_t ? 
            `${_meta.static ? 'static ' : ''}method ${_meta.owner.typeMeta.abstract?.name}.${_meta.functionMeta.name}()` 
            : _meta instanceof function_metadata_t ? `${_meta.name}()`: undefined;
}