const propertyDecorator = require('../libs/propertyDecorator.js');
const parameterDecorator = require('../libs/parameterDecorator.js');
const footprint = require('../libs/footPrint.js');
const { TYPE, DECORATED_VALUE } = require('../libs/constant.js');
const { pseudo_parameter_decorator_context_t } = require('../utils/pseudoDecorator.js');
const { property_metadata_t, parameter_metadata_t } = require('../reflection/metadata.js');
const { markAsDecorator } = require('../utils/decorator/general.js');

const ACCEPT_DECORATOR_KINDS = ['accessor', 'method', 'parameter'];

module.exports = type;

function type(_abstract) {

    preventImmediateValue(_abstract);

    return function typeDecorator(prop, context) {

        markAsDecorator(typeDecorator);

        const {kind} = context;

        isValidKindOrFail(kind);

        // const propMeta = propertyDecorator.initMetadata(prop, context);

        // const alreadyApplied = footprint.decoratorHasFootPrint(prop, context, TYPE)

        // if (alreadyApplied) {

        //     throw new Error('cannot apply @type multiple times');
        // }

        // if (context.kind === 'parameter') {

        //     return handleParameter(_abstract, ...arguments);
        // }

        /**
        //  * When the decorator is applied on attribute or method
        //  */
        // propMeta.type = _abstract;
        // //footprint.setDecoratorFootPrint(prop, context, TYPE);
        // footprint.setMetadataFootPrint(propMeta, TYPE);

        // return footprint.retrieveDecoratorFootPrintByKey(prop, context, DECORATED_VALUE);

        const meta = kind === 'parameter' ? 
                    parameterDecorator.initMetadata(...arguments)
                    : propertyDecorator.initMetadata(...arguments);

        if (footprint.metadataHasFootPrint(meta, TYPE)) {

            throw new Error('cannot apply @type multiple times');
        }
        
        footprint.setMetadataFootPrint(meta, TYPE);
        meta.type = _abstract;        

        return kind === 'parameter' ? prop
                : footprint.getMetadataFootPrintByKey(meta, DECORATED_VALUE);
    }
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