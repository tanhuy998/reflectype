/**
 * 
 * @param {property_metadata_t} _propMeta 
 */
function initTypeMetaFootPrint(_propMeta) {

    if (typeof _propMeta !== 'object') {

        return;
    }

    if (typeof _propMeta.footPrint !== 'object') {

        _propMeta.footPrint = {};

        return;
    }

    _propMeta.footPrint ??= {};
}

module.exports = initTypeMetaFootPrint;