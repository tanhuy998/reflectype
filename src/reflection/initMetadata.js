const isAbStract = require('../utils/isAbstract.js');
const isFirstClass = require('../utils/isFirstClass.js')
const {metaOf, METADATA, TYPE_JS, metadata_t} = require('./metadata');


function initMetadata(_unknown) {

    const metadata = metaOf(_unknown);

    if (typeof _unknown !== 'function' && !_unknown.prototype) {

        return;
    }

    if (typeof metadata === 'object' && metadata.abstract === _unknown ) {

        return;
    }

    _unknown[METADATA] ??= {};

    const meta = new metadata_t(_unknown);

    _unknown[METADATA][TYPE_JS] = meta;
}

module.exports = initMetadata;