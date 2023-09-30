const initMetadata = require('./initMetadata.js');
const {metadata_t, metaOf} = require('./metadata.js')
const {METADATA, TYPE_JS} = require('./metadata.js');

function initPrototypeMetadata(_abstract) {

    initMetadata(_abstract);

    //const meta = _abstract[METADATA][TYPE_JS];
    const meta = metaOf(_abstract);

    if (typeof meta.prototype === 'object') {

        return false;
    }

    // const prototypeMeta = {
    //     properties: {

    //     }
    // }

    const prototypeMeta = new metadata_t(_abstract);

    meta.prototype = prototypeMeta;

    _abstract.prototype[METADATA] ??= {};
    _abstract.prototype[METADATA][TYPE_JS] = prototypeMeta;

    return true;
}

module.exports = initPrototypeMetadata;