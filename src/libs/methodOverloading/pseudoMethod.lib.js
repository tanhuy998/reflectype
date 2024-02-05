const config = require('../../../config.json');
const { retrieveDecoratorFootPrintByKey } = require('../footPrint');
const { PSEUDO_OVERLOADED_METHOD_NAME } = require('./constant');

const PSEUDO_METHOD_NAME_PATTERN = /^pseudoMethod\$(\w+)-\d+$/;
const TARGET_NAME = 1;

module.exports = {
    ensureIfPseudoMethodTakeRightPlace,
    retrieveOverloadedNameIfPseudoMethodExists,
    retrieveOverloadedNameIfPseudoMethodExists,
};

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
