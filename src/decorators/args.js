const propertyDecorator = require('../libs/propertyDecorator.js');

/**
 * 
 * @param  {...any} values 
 */
function args(...values) {

    return function(_method, _context) {

        const {kind, name} = _context;

        if (kind !== 'method') {

            throw new Error('cannot apply @args to object that is not a function');
        }

        const wrapperMetadata = propertyDecorator.initMetadata(_context);

        
    }
}

module.exports = args;