const { metadata_t } = require("../../reflection/metadata");
const { discoverClassConstructor } = require('../decoratorGeneral');

module.exports = {
    resolveTypeMetaResolution,
};

/**
 * @param {Function} _class
 * @param {metadata_t} _typeMeta 
 */
function resolveTypeMetaResolution(_class, _typeMeta) {

    if (typeof _typeMeta.loopback !== 'object') {

        return;
    } 

    _typeMeta.abstract ||= _class;
    delete _typeMeta.loopback;

    discoverClassConstructor.call(_class);
}
