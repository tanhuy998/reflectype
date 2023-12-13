const propertyDecorator = require('../libs/propertyDecorator.js');
const accessorDecorator = require('../libs/accessorDecorator.js');
const {METADATA} = require('../reflection/metadata.js');
const Interface = require('../interface/interface.js');
const isPrimitive = require('../utils/isPrimitive.js');
const typeMetadata = require('../reflection/metadata.js');

const {TYPE_JS, property_metadata_t, metadata_t} = require('../reflection/metadata.js');
const {IS_CHECKABLE} = require('../constants.js');
const { decorateMethod } = require('../libs/methodDecorator.js');
const Void = require('../type/void.js');
const footprint = require('../libs/footPrint.js');
const { TYPE, DECORATED_VALUE } = require('../libs/constant.js');
const footPrint = require('../libs/footPrint.js');

function type(_abstract) {

    preventImmediateValue(_abstract);

    const isInterface = _abstract.__proto__ === Interface;

    return function handle(prop, context) {

        const {kind, name, static} = context;

        const propMeta = propertyDecorator.initMetadata(prop, context);
        const alreadyApplied = footprint.hasFootPrint(prop, context, TYPE)//propertyDecorator.hasFootPrint(propMeta, 'typeDecoratorApplied')

        if (alreadyApplied) {

            throw new Error('cannot apply @type multiple times');
        }

        propMeta.type = _abstract;

        footprint.setFootPrint(prop, context, TYPE);
        console.log(footprint.retrieveFootPrintByKey(prop, context, DECORATED_VALUE))
        return footprint.retrieveFootPrintByKey(prop, context, DECORATED_VALUE);
        // switch(kind) {
        //     case 'accessor':
        //         return handleAccessor(prop, propMeta, context, _abstract);
        //     case 'method':
        //         return handleTypeForMethod(prop, context, _abstract);
        //     default:
        //         throw new Error('Decorator @type just applied to auto assessor, add \'accessor\' syntax before the class property');
        // }
    }
}

function handleAccessor(_accessor, initPropMeta, context, _abstract) {

    if (_abstract === Void) {

        throw new TypeError('class field could not be type of [Void]');
    }

    const defaultGetter = _accessor.get;
    const defaultSetter = _accessor.set;

    const {static, private, name} = context;

    
    // const initPropMeta = propertyDecorator.outerMetadataExist(context) ? 
    //                 propertyDecorator.initMetadata(_accessor, context) 
    //                 : typeMetadata.metaOf(defaultGetter) || new property_metadata_t();

    /**@type {property_metadata_t} */
    //const initPropMeta = propertyDecorator.initMetadata(_accessor, context);

    if (!initPropMeta) {

        return;
    }

    // defaultGetter[METADATA] ??= {};
    // defaultGetter[METADATA][TYPE_JS] = initPropMeta;

    // const newAccessor = {
    //     get: defaultGetter,
    //     set: accessorDecorator.generateAccessorSetter(initPropMeta, defaultSetter),
    //     init: accessorDecorator.generateAccessorInitializer(initPropMeta)
    // }

    // initPropMeta.footPrint.typeDecoratorApplied = true;
    // initPropMeta.footPrint.accessor = newAccessor;

    _accessor.init = accessorDecorator.generateAccessorInitializer(initPropMeta);
    footprint.setFootPrint(_accessor, context, 'typeDecoratorApplied');
    //footprint.setFootPrint(newAccessor, context, 'accessor', newAccessor);

    return _accessor;
}

function handleTypeForMethod(_method, context, _abstract) { 

    if (typeof _method !== 'function') {

        return;
    }

    /**@type {property_metadata_t} */
    const propMeta = propertyDecorator.initMetadata(_method, context);

    if (!propMeta) {

        return;
    }

    const {addInitializer, name} = context;

    //propMeta.footPrint.typeDecoratorApplied = true;
    propMeta.type = _abstract;

    const newMethod = decorateMethod(_method);

    footprint.setFootPrint(_method, context, 'typeDecoratorApplied');
    footprint.setFootPrint(_method, context, 'decoratedMethod', newMethod);

    addInitializer(function () {
        // not test for the case that subclass override the method
        Object.defineProperty(this, name, {
            enumerable: true,
            configurable: false,
            writable: false,
            value: newMethod,
        })
    })

    //return propMeta.footPrint.decoratedMethod ??= decorateMethod(_method);
    return newMethod;
}



function preventImmediateValue(_target) {

    if (typeof _target !== 'function' && !_target.prototype) {

        throw new TypeError('require a constructor, immediate value given');
    }
}

module.exports = type;