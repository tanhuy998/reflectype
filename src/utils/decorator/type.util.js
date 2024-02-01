const parameterDecorator = require('../../libs/parameterDecorator');
const propertyDecorator = require('../../libs/propertyDecorator')
const { pseudo_parameter_decorator_context_t } = require('../pseudoDecorator');
const methodVariant = require('../../libs/methodVariant.lib');
const { parameter_metadata_t } = require('../../reflection/metadata');

module.exports = {
    resolvePropMetaForParameter,
    resolvePropMetaForProperty,
    manipulateMethodParameterTrie,
}

/**
 * 
 * @param {parameter_metadata_t} paramMeta 
 */
function manipulateMethodParameterTrie(paramMeta) {

    methodVariant.locateNewFuncVariantTrieNode(paramMeta);
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

