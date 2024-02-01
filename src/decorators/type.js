const propertyDecorator = require('../libs/propertyDecorator.js');
const parameterDecorator = require('../libs/parameterDecorator.js');
const footprint = require('../libs/footPrint.js');
const { TYPE, DECORATED_VALUE } = require('../libs/constant.js');
const { pseudo_parameter_decorator_context_t } = require('../utils/pseudoDecorator.js');
const { property_metadata_t, parameter_metadata_t } = require('../reflection/metadata.js');
const { markAsDecorator } = require('../utils/decorator/general.js');
const { resolvePropMetaForParameter, resolvePropMetaForProperty, manipulateMethodParameterTrie } = require('../utils/decorator/type.util.js');

const ACCEPT_DECORATOR_KINDS = ['accessor', 'method', 'parameter'];

module.exports = type;

function type(_abstract) {

    preventImmediateValue(_abstract);

    function typeDecorator(prop, context) {

        const {kind} = context;

        isValidKindOrFail(kind);

        const meta = kind === 'parameter' ? 
                    resolvePropMetaForParameter(...arguments)
                    : resolvePropMetaForProperty(...arguments);

        if (footprint.metadataHasFootPrint(meta, TYPE)) {

            throw new Error('cannot apply @type multiple times');
        }
        
        footprint.setMetadataFootPrint(meta, TYPE);
        meta.type = _abstract;        

        // if (kind === 'parameter') {

        //     manipulateMethodParameterTrie(meta);
        // }

        return kind === 'parameter' ? prop
                : footprint.getMetadataFootPrintByKey(meta, DECORATED_VALUE);
    }

    markAsDecorator(typeDecorator);
    return typeDecorator;
}

function isValidKindOrFail(decoratorKind) {

    if (!ACCEPT_DECORATOR_KINDS.includes(decoratorKind)) {

        throw new Error('@type decorator just can be applied either method, auto accessor or parameter');
    }

    return true;
}



// /**
//  * 
//  * @param {any} _ 
//  * @param {pseudo_parameter_decorator_context_t} context 
//  */
// function handleParameter(_abstract, _, context) {

//     const paramMeta = parameterDecorator.initMetadata(_, context);

//     paramMeta.type = _abstract;
//     footprint.setMetadataFootPrint(propMeta.functionMeta, TYPE);

//     return _;
// }

function preventImmediateValue(_target) {

    if (typeof _target !== 'function' && !_target.prototype) {

        throw new TypeError('require a constructor, immediate value given');
    }
}