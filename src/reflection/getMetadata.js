const {METADATA, TYPE_JS, metaOf} = require('./metadata.js');

function getMetadata (_object) {

    //return _object[METADATA][TYPE_JS];
    return metaOf(_object);
}


module.exports = getMetadata;