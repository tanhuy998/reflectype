const config = require('../../../config.json');
const { property_metadata_t } = require('../../reflection/metadata');
const { retrieveDecoratorFootPrintByKey, getMetadataFootPrintByKey } = require('../footPrint');
const { PSEUDO_OVERLOADED_METHOD_NAME } = require('./constant');

const PSEUDO_METHOD_NAME_PATTERN = /^pseudoMethod\$(\w+)-\d+$/;
const TARGET_NAME = 1;

module.exports = {
    ensureIfPseudoMethodTakeRightPlace,
    retrieveOverloadedNameIfPseudoMethodExists,
    retrieveOverloadedNameIfPseudoMethodExists,
    isPseudoMethod,
};

/**
 * 
 * @param {property_metadata_t} propMeta 
 * @returns 
 */
function isPseudoMethod(propMeta) {

  return propMeta.isMethod &&
        typeof getMetadataFootPrintByKey(propMeta, PSEUDO_OVERLOADED_METHOD_NAME) === 'string';
}

function ensureIfPseudoMethodTakeRightPlace(_, decoaratorContext) {

    const {name, kind} = decoaratorContext;

    if (
        config.reflectypeOfficialDecorator &&
        typeof name !== 'symbol'
    ) {

        return;
    }

    const match = extractMethodName(name)?.match(PSEUDO_METHOD_NAME_PATTERN);

    if (match && kind !== 'method') {

        throw new Error('invalid use of METHOD');
    }

    return match?.[TARGET_NAME];
}


function retrieveOverloadedNameIfPseudoMethodExists(_, decoratorContext) {
    
    return retrieveDecoratorFootPrintByKey(_, decoratorContext, PSEUDO_OVERLOADED_METHOD_NAME);
}

/**
 * 
 * @param {string|symbol} _name 
 */
function extractMethodName(_name) {

    if (typeof _name === 'string') {

        return _name;
    }

    if (typeof _name === 'symbol') {

        return _name.description;
    }
}
