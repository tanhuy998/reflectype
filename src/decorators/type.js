const propertyDecorator = require('../libs/propertyDecorator.js');
const accessorDecorator = require('../libs/accessorDecorator.js');
const {METADATA} = require('../reflection/metadata.js');
const Interface = require('../interface/interface.js');
const isPrimitive = require('../utils/isPrimitive.js');
const typeMetadata = require('../reflection/metadata.js');

const {TYPE_JS, property_metadata_t, metadata_t} = require('../reflection/metadata.js');
const {IS_CHECKABLE} = require('../constants.js');
const { decorateMethod } = require('../libs/methodDecorator.js');

function type(_abstract) {

    preventImmediateValue(_abstract);

    const isInterface = _abstract.__proto__ === Interface;

    return function handle(prop, context) {
        const {kind, name, static} = context;

        const propMeta = propertyDecorator.initMetadata(prop, context);
        const alreadyApplied = propertyDecorator.hasFootPrint(propMeta, 'typeDecoratorApplied')

        if (alreadyApplied) {

            throw new Error('cannot apply @type multiple times');
        }

        switch(kind) {

            case 'accessor':
                return handleAccessor(prop, context, _abstract);
            case 'method':
                return handleTypeForMethod(prop, context, _abstract);
            default:
                throw new Error('Decorator @type just applied to auto assessor, add \'accessor\' syntax before the class property');
        }
    }
}

function handleAccessor(_accessor, context, _abstract) {

    const defaultGetter = _accessor.get;
    const defaultSetter = _accessor.set;

    const {static, private, name} = context;

    
    // const initPropMeta = propertyDecorator.outerMetadataExist(context) ? 
    //                 propertyDecorator.initMetadata(_accessor, context) 
    //                 : typeMetadata.metaOf(defaultGetter) || new property_metadata_t();

    /**@type {property_metadata_t} */
    const initPropMeta = propertyDecorator.initMetadata(_accessor, context);

    if (!initPropMeta) {

        return;
    }

    defaultGetter[METADATA] ??= {};
    defaultGetter[METADATA][TYPE_JS] = initPropMeta;

    initPropMeta.typeDecoratorApplied = true;
    initPropMeta.type = _abstract;
    initPropMeta.name ??= name;
    initPropMeta.private ??= private;
    initPropMeta.static ??= static;
    initPropMeta.isMethod = false;
    initPropMeta.allowNull ??= false;

    return {
        get: defaultGetter,
        set: accessorDecorator.generateAccessorSetter(initPropMeta, defaultSetter),
        init: accessorDecorator.generateAccessorInitializer(initPropMeta)
    }
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

    propMeta.footPrint.typeDecoratorApplied = true;
    propMeta.type = _abstract;

    return propMeta.footPrint.decoratedMethod ??= decorateMethod(_method);
}



function preventImmediateValue(_target) {

    if (typeof _target !== 'function' && !_target.prototype) {

        throw new TypeError('require a constructor, immediate value given');
    }
}

module.exports = type;