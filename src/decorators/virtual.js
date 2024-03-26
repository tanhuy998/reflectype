const { DECORATED_VALUE } = require('../libs/constant');
const { setMetadataFootPrint, getMetadataFootPrintByKey } = require('../libs/footPrint');
const propertyDecorator = require('../libs/propertyDecorator');

module.exports = virtual;

function virtual(_, context) {

    if (context.kind !== 'method') {

        throw new Error();
    }

    const propMeta = propertyDecorator.initMetadata(_, context);

    propMeta.functionMeta.allowOverride = true;
    propMeta.functionMeta.isVirtual = true;

    return getMetadataFootPrintByKey(propMeta, DECORATED_VALUE);
}