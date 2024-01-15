const { DECORATED_VALUE } = require("../libs/constant");
const { retrieveDecoratorFootPrintByKey } = require("../libs/footPrint");
const { refreshMeta } = require("../libs/methodDecorator");
const { prepareParamsDecorator, mapParamsByNames } = require("../utils/decorator/paramsType.util");

module.exports = parameters

function parameters(paramsList) {

    if (typeof paramsList !== 'object') {

        throw new Error('paramList must be an object');
    }

    return function(_, context) {

        const propMeta = prepareParamsDecorator(_, context);

        mapParamsByNames(paramsList, propMeta);
        refreshMeta(propMeta);

        return retrieveDecoratorFootPrintByKey(_, context, DECORATED_VALUE);
    }
}