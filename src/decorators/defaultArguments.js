const propertyDecorator = require('../libs/propertyDecorator.js');
const { TYPE_JS } = require('../reflection/metadata.js');
const {hasFootPrint} = require('../libs/propertyDecorator.js')
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

        const propMeta = propertyDecorator.initMetadata(_method, _context);

        const isApplied = hasFootPrint(propMeta, 'defaultArgumentMetadataApplied');

        if (isApplied) {

            throw new Error('cannot apply @type multiple times');
        }

        propMeta.value = args;

        return _method;
    }
}



module.exports = defaultArguments;