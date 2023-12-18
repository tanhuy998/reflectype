const propertyDecorator = require('../libs/propertyDecorator.js');
const { compareArgsWithType } = require('../libs/argumentType.js');
const { hasFootPrint, setFootPrint } = require('../libs/footPrint.js');
const { DEFAULT_ARGS } = require('../libs/constant.js');
/**
 * 
 * @param  {...any} values 
 */
function defaultArguments(...args) {

    return function (_method, _context) {

        const { kind } = _context;

        if (kind !== 'method') {

            throw new Error('cannot apply @args to object that is not a function');
        }

        const propMeta = propertyDecorator.initMetadata(_method, _context);

        const isApplied = hasFootPrint(propMeta, DEFAULT_ARGS);

        if (isApplied) {

            throw new Error('cannot apply @type multiple times');
        }

        compareArgsWithType(propMeta);

        propMeta.value = args;

        setFootPrint(_method, _context, DEFAULT_ARGS);

        return _method;
    }
}



module.exports = defaultArguments;