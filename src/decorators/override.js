const { DECORATED_VALUE } = require('../libs/constant');
const { getMetadataFootPrintByKey, setMetadataFootPrint } = require('../libs/footPrint');
const propertyDecorator = require('../libs/propertyDecorator');

module.exports = override;

function override(_, context) {

    if (context.kind !== 'method') {

        throw new Error();
    }

    const propMeta = propertyDecorator.initMetadata(_, context);
    const isOverloadingAnother = getMetadataFootPrintByKey(propMeta)
    //setMetadataFootPrint()

    return getMetadataFootPrintByKey(propMeta, DECORATED_VALUE);
}