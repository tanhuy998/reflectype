const {initMetadata} = require('../libs/propertyDecorator.js');
const { property_metadata_t } = require('../reflection/metadata.js');
const {compareArgsWithType} = require('../libs/argumentType.js');
const {isInstantiable} = require('../libs/type.js');
const { hasFootPrint } = require('../libs/footPrint.js');

function paramsType(..._types) {

    if (_types.length === 0) {

        throw new Error('@paramsType must be passed at least 1 argument');
    }

    return function (_, _context) {

        const {kind} = _context;

        if (kind !== 'method') {

            throw new Error('@paramsType just affect on method')
        }

        /**@type {property_metadata_t} */
        const propMeta = initMetadata(_, _context);
        const isApplied = hasFootPrint(_, _context, 'paramsTypeDecoratorApplied');

        if (isApplied) {

            throw new Error('cannot apply @paramsType multiple times');
        }

        validateInput(_types);

        propMeta.defaultParamsType = _types;
        
        compareArgsWithType(propMeta);

        return _;
    }
}

function validateInput(_types = []) {   

    for (const type of _types) {

        if (!isInstantiable(type)) {

            throw new TypeError('parameter\'s type must be a class');
        }
    }
}

module.exports = paramsType;