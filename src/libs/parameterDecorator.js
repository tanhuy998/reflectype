const { property_metadata_t, parameter_metadata_t } = require('../reflection/metadata');
const { generateMethodDecoratorContext, pseudo_parameter_decorator_context_t } = require('../utils/pseudoDecorator');
const { initMetadataFootPrint } = require('./footPrint');
const propertyDecorator = require('./propertyDecorator');

module.exports = {
    initMetadata
}

/**
 * 
 * @param {any} _ 
 * @param {pseudo_parameter_decorator_context_t} context 
 * @returns 
 */
function initMetadata(_, context) {

    const {kind, index, name} = context;

    if (kind !== 'parameter') {

        throw new Error();
    }

    const propMeta = propertyDecorator.initMetadata(_, pseudoContext);
    const funcMeta = propMeta.functionMeta;


    const paramMeta = resolveParamMeta(propMeta);

    return paramMeta;
}



/**
 * 
 * @param {property_metadata_t} propMeta 
 * @returns {parameter_metadata_t}
 */
function resolveParamMeta(propMeta) {

    const paramMeta = new parameter_metadata_t(propMeta.functionMeta);

    return paramMeta;
}