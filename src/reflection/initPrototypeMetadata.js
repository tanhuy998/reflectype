const initMetadata = require('./initMetadata.js');
const {metadata_t} = require('./metadata.js')
const {METADATA} = require('./metadata.js');

function initPrototypeMetadata(_abstract) {

    initMetadata(_abstract);

    const meta = _abstract[METADATA];

    if (typeof meta.prototype === 'object') {

        return;
    }

    // const prototypeMeta = {
    //     properties: {

    //     }
    // }

    const prototypeMeta = new metadata_t(_abstract);

    _abstract[METADATA].prototype = prototypeMeta;
}

module.exports = initPrototypeMetadata;