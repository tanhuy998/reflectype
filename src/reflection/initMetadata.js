const METADATA = require('./metadata');


function initMetadata(_abstract) {

    if (typeof _abstract[METADATA] === 'object') {

        return;
    }

    const meta = {
        properties: {

        }
    }

    _abstract[METADATA] = meta;
}



module.exports = initMetadata;