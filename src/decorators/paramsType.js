const {initMetadata} = require('../libs/propertyDecorator.js');
const { property_metadata_t } = require('../reflection/metadata.js');
const {compareArgsWithType} = require('../libs/argumentType.js');
const {isInstantiableOrFail} = require('../libs/type.js');
const { hasFootPrint, setFootPrint } = require('../libs/footPrint.js');
const { PARAM } = require('../libs/constant.js');

function paramsType(..._types) {

    validateInput(_types);

    return function (_, _context) {

        const {kind} = _context;

        if (kind !== 'method') {

            throw new Error('@paramsType just affect on method')
        }

        /**@type {property_metadata_t} */
        const propMeta = initMetadata(_, _context);
        const isApplied = hasFootPrint(_, _context, PARAM);

        if (isApplied) {

            throw new Error('cannot apply @paramsType multiple times');
        }

        compareArgsWithType(propMeta);
        setFootPrint(_, _context, PARAM);

        propMeta.defaultParamsType = _types;

        return _;
    }
}

function validateInput(_types = []) {   

    if (_types.length === 0) {

        throw new Error('@paramsType must be passed at least 1 argument');
    }

    try {

        for (const t of _types) {

            isInstantiableOrFail(t);
        }
    }
    catch {

        throw new TypeError('parameter\'s type must be a class');
    }
}

module.exports = paramsType;