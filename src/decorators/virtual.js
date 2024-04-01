const { DECORATED_VALUE } = require('../libs/constant');
const { setMetadataFootPrint, getMetadataFootPrintByKey } = require('../libs/footPrint');
const { OVERRIDE_APPLIED } = require('../libs/methodOverloading/constant');
const propertyDecorator = require('../libs/propertyDecorator');

module.exports = virtual;

function virtual(_, context) {

    if (context.kind !== 'method') {

        throw new Error('@virtual just been applied to method');
    }

    if (context.static) {

        throw new Error('static method could not be virtual');
    }

    const propMeta = propertyDecorator.initMetadata(_, context);

    if (getMetadataFootPrintByKey(propMeta.functionMeta, OVERRIDE_APPLIED)) {

        throw new SyntaxError('Could not mark a method as virtual which intent to override it\'s base class method');
    }

    propMeta.functionMeta.allowOverride = true;
    propMeta.functionMeta.isVirtual = true;
    propMeta.functionMeta.vTable = new Map();

    return getMetadataFootPrintByKey(propMeta, DECORATED_VALUE);
}