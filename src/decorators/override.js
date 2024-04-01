const { DECORATED_VALUE } = require('../libs/constant');
const { getMetadataFootPrintByKey, setMetadataFootPrint } = require('../libs/footPrint');
const { OVERLOADED_METHOD_NAME, OVERRIDE_APPLIED } = require('../libs/methodOverloading/constant');
const propertyDecorator = require('../libs/propertyDecorator');

module.exports = override;

function override(_, context) {

    if (context.kind !== 'method') {

        throw new Error('@override just been applied to method');
    }

    if (context.static) {

        throw new Error('@override is not allowed for static method');
    }

    const propMeta = propertyDecorator.initMetadata(_, context);

    if (propMeta.functionMeta.isVirtual) {

        throw new SyntaxError('Could not mark a virtual method to override it\'s base class method');
    }

    // const overloadedMethodName = getMetadataFootPrintByKey(propMeta, OVERLOADED_METHOD_NAME);

    // if (!overloadedMethodName) {

    //     throw new ReferenceError('invalid use of @override');
    // }

    setMetadataFootPrint(propMeta, OVERRIDE_APPLIED);

    return getMetadataFootPrintByKey(propMeta, DECORATED_VALUE);
}