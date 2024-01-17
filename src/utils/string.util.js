const { REGEX_DECORATOR_DETECT, REGEX_DEFAULT_ARG } = require("../libs/constant");
const { property_metadata_t, function_metadata_t } = require("../reflection/metadata");

module.exports = {
    reproduceReadableFunctionIndentifier,
    reproduceReadableClassAttributeIndentifier,
    removeDecoratorNotation,
    removeParamDefaultArg,
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

/**
 * 
 * @param {property_metadata_t} _propMeta
 * @returns {string} 
 */
function reproduceReadableClassAttributeIndentifier(_propMeta) {

    return `${_propMeta.static ? 'static ' : ''}attribute ${_propMeta.owner.typeMeta.abstract.name}.${_propMeta.name}`
}

/**
 * 
 * @param {string} _str
 * @returns {string} 
 */
function removeDecoratorNotation(_str) {

    if (typeof _str !== 'string') {

        return _str;
    }

    return _str.replace(REGEX_DECORATOR_DETECT, '');
}

function removeParamDefaultArg(_str) {

    if (typeof _str !== 'string') {

        return _str;
    }

    return _str.replace(REGEX_DEFAULT_ARG, '');
}