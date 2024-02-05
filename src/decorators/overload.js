const {DECORATED_VALUE} = require('../libs/constant');
const { getMetadataFootPrintByKey } = require('../libs/footPrint');
const { isNonIterableObjectKey } = require('../libs/type');
const { manipulateOverloading } = require('../utils/decorator/overload.util');

module.exports = overload;

function overload(nameOfMethodToOverload) {

    if (!isNonIterableObjectKey(nameOfMethodToOverload)) {

        throw new TypeError();
    }

    return function(_, context) {

        const propMeta = manipulateOverloading(_, context, nameOfMethodToOverload);

        return getMetadataFootPrintByKey(propMeta, DECORATED_VALUE);
    }
}
