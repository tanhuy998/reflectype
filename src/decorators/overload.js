const {DECORATED_VALUE} = require('../libs/constant');
const { getMetadataFootPrintByKey } = require('../libs/footPrint');
const { isNonIterableObjectKey } = require('../libs/type');
const { manipulateOverloading, validateAndReturnTargetPropMeta } = require('../utils/decorator/overload.util');
const propertyDecorator = require('../libs/propertyDecorator');

module.exports = overload;

function overload(nameOfMethodToOverload) {

    if (!isNonIterableObjectKey(nameOfMethodToOverload)) {

        throw new TypeError();
    }

    return function(_, decoratorContext) {

        //const propMeta = manipulateOverloading(_, context, nameOfMethodToOverload);

        const targetPropMeta = validateAndReturnTargetPropMeta(_, decoratorContext, nameOfMethodToOverload);
        const propMeta = propertyDecorator.initMetadata(_, decoratorContext);

        setupOverload(_, decoratorContext, propMeta, targetPropMeta);

        return getMetadataFootPrintByKey(propMeta, DECORATED_VALUE);
    }
}
