const METADATA = require('./metadata.js');

function getMetadata (_object) {

    return _object[METADATA];
}

module.exports = getMetadata;