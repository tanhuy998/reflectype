const initMetadata = require('./initMetadata.js');
const METADATA = require('./metadata.js');

function initPrototypeMetadata(_abstract) {

    initMetadata(_abstract);

    const meta = _abstract[METADATA];

    if (typeof meta.prototype === 'object') {

        return;
    }

    const prototypeMeta = {
        properties: {

        }
    }

    _abstract[METADATA].prototype = prototypeMeta;
}

module.exports = initPrototypeMetadata;