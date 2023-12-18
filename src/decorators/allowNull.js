const { DECORATED_VALUE } = require('../libs/constant.js');
const { retrieveFootPrintByKey } = require('../libs/footPrint.js');
const propertyDecorator = require('../libs/propertyDecorator.js');


function allowNull(_, _context) {

    const {kind} = _context;

    if (kind === 'class') {

        throw new TypeError('cannot apply @allowNull on class');
    }

    const propMeta = propertyDecorator.initMetadata(_, _context);

    propMeta.allowNull = true;
    
    return retrieveFootPrintByKey(_, _context, DECORATED_VALUE);
}

module.exports = allowNull;
