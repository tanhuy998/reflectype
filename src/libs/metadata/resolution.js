const { metadata_t } = require("../../reflection/metadata");

module.exports = {
    resolveTypeMetaResolution,
};

/**
 * @param {Function} _class
 * @param {metadata_t} _typeMeta 
 */
function resolveTypeMetaResolution(_class, _typeMeta) {

    _typeMeta.abstract ||= _class;
    delete _typeMeta.loop;
}
