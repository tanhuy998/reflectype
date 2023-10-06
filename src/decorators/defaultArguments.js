const propertyDecorator = require('../libs/propertyDecorator.js');
const { TYPE_JS } = require('../reflection/metadata.js');

/**
 * 
 * @param  {...any} values 
 */
function defaultArguments(...args) {

    return function(_method, _context) {

        const {kind, name} = _context;

        if (kind !== 'method') {

            throw new Error('cannot apply @args to object that is not a function');
        }

        const propMeta = propertyDecorator.initMetadata(_context);

        propMeta.value = args;

        return _method;
    }
}



module.exports = defaultArguments;