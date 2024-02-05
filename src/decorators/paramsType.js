const { DECORATED_VALUE } = require('../libs/constant.js');
const footprint = require('../libs/footPrint.js');
const { refreshPropMeta } = require('../libs/propertyDecorator.js');
const { markAsDecorator } = require('../utils/decorator/general.js');
const { postDecoratorInit } = require('../utils/decorator/parameterDecoratorGeneral.util.js');
const { mapParamsByList, prepareParamsDecorator, mapList_validateInput } = require('../utils/decorator/paramsType.util.js');
const defineParam = require('./defineParam.js');
const type = require('./type.js');

module.exports = paramsType;

function paramsType(..._types) {

    mapList_validateInput(_types);

    function paramsTypeDecorator(_, _context) {

        const propMeta = prepareParamsDecorator(_, _context);
        
        refreshPropMeta(propMeta);
        iterateTypeList(_types, ...arguments);
        postDecoratorInit(_, _context, propMeta);

        return footprint.retrieveDecoratorFootPrintByKey(_, _context, DECORATED_VALUE);
    }

    markAsDecorator(paramsTypeDecorator);
    return paramsTypeDecorator;
}

function iterateTypeList(typeList, _, context) {

    let i = 0;

    for (const _type of typeList || []) {

        defineParam({index: i++, decorators: type(_type)})(_, context);
    }
}