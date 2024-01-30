const parameterDecorator = require('../../libs/parameterDecorator');
const propertyDecorator = require('../../libs/propertyDecorator')
const { pseudo_parameter_decorator_context_t } = require('../pseudoDecorator');

module.exports = {
    resolvePropMetaForParameter,
    resolvePropMetaForProperty,
}

/**
 * 
 * @param {any} _ 
 * @param {pseudo_parameter_decorator_context_t} context 
 * @returns 
 */
function resolvePropMetaForParameter(_, context) {

    const paramMeta = parameterDecorator.initMetadata(...arguments);



    return paramMeta;
}

function resolvePropMetaForProperty(_, context) {

    return propertyDecorator.initMetadata(...arguments);
}

