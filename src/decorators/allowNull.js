const { DECORATED_VALUE } = require('../libs/constant.js');
const { retrieveDecoratorFootPrintByKey, getMetadataFootPrintByKey } = require('../libs/footPrint.js');
const propertyDecorator = require('../libs/propertyDecorator.js');
const parameterDecorator = require('../libs/parameterDecorator.js');

function allowNull(_, _context) {

    const {kind} = _context;

    if (kind === 'class') {

        throw new TypeError('cannot apply @allowNull on class');
    }

    const meta = kind === 'parameter' ?
                    parameterDecorator.initMetadata(...arguments)
                    : propertyDecorator.initMetadata(_, _context);

    meta.allowNull = true;

    if (kind !== 'parameter') {

        propertyDecorator.refreshPropMeta(meta);
    }

    //return retrieveDecoratorFootPrintByKey(_, _context, DECORATED_VALUE);
    return getMetadataFootPrintByKey(DECORATED_VALUE);
}

module.exports = allowNull;
