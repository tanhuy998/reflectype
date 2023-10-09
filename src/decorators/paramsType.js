const {initMetadata, hasFootPrint} = require('../libs/propertyDecorator.js');
const { property_metadata_t } = require('../reflection/metadata.js');
const {compareArgsWithType} = require('../libs/argumentType.js');

function paramsType(..._types) {

    if (_types.length === 0) {

        throw new Error('@paramsType must be passed at least 1 argument');
    }

    return function (_method, _context) {

        const {kind} = _context;

        if (kind !== 'method') {

            throw new Error('@paramsType just affect on method')
        }

        /**@type {property_metadata_t} */
        const propMeta = initMetadata(_method, _context);

        const isApplied = hasFootPrint(propMeta, 'paramsTypeDecoratorApplied');

        if (isApplied) {

            throw new Error('cannot apply @paramsType multiple times');
        }

        validateInput(_types);

        propMeta.defaultParamsType = _types;
        
        compareArgsWithType(propMeta);

        const {decoratedMethod} = propMeta.footPrint;

        return decoratedMethod;
    }
}

function isInstantiate(_type) {

    return typeof _type === 'function' && typeof _type.prototype === 'object';
}

function validateInput(_types = []) {   

    for (const type of _types) {

        if (!isInstantiate(type)) {

            throw new TypeError('parameter\'s type must be a class');
        }
    }
}

module.exports = paramsType;