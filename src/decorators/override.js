const { DECORATED_VALUE } = require('../libs/constant');
const { getMetadataFootPrintByKey, setMetadataFootPrint } = require('../libs/footPrint');
const { OVERLOADED_METHOD_NAME, OVERRIDE_APPLIED } = require('../libs/methodOverloading/constant');
const propertyDecorator = require('../libs/propertyDecorator');

module.exports = override;

function override(_, context) {

    if (context.kind !== 'method') {

        throw new Error();
    }

    const propMeta = propertyDecorator.initMetadata(_, context);
    const overloadedMethodName = getMetadataFootPrintByKey(propMeta, OVERLOADED_METHOD_NAME);

    if (!overloadedMethodName) {

        throw new ReferenceError('invalid use of @override');
    }

    setMetadataFootPrint(propMeta, OVERRIDE_APPLIED);

    return getMetadataFootPrintByKey(propMeta, DECORATED_VALUE);
}