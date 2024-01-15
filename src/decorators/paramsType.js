const { DECORATED_VALUE } = require('../libs/constant.js');
const footprint = require('../libs/footPrint.js');
const { refreshPropMeta } = require('../libs/propertyDecorator.js');
const { mapParamsByList, prepareParamsDecorator, mapList_validateInput } = require('../utils/decorator/paramsType.util.js');

module.exports = paramsType;

function paramsType(..._types) {

    mapList_validateInput(_types);

    return function (_, _context) {

        const propMeta = prepareParamsDecorator(_, _context);

        mapParamsByList(_types, propMeta);
        refreshPropMeta(propMeta);

        return footprint.retrieveDecoratorFootPrintByKey(_, _context, DECORATED_VALUE);
    }
}