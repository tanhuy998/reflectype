const propertyDecorator = require('../libs/propertyDecorator.js');
const {METADATA} = require('../reflection/metadata.js');
const Interface = require('../interface/interface.js');
const isPrimitive = require('../utils/isPrimitive.js');
const typeMetadata = require('../reflection/metadata.js');

const {TYPE_JS, property_metadata_t, metadata_t} = require('../reflection/metadata.js');

function type(_abstract) {

    preventImmediateValue(_abstract);

    const isInterface = _abstract.__proto__ === Interface;

    return handle;

    // return function(instance, context) {

    //     return handle(instance, context); 
    // }

    function handle(prop, context) {
        const {kind, name, static} = context;

        const meta = context.metadata;

        if (alreadyApplied(prop, context)) {

            throw new Error('cannot assign @type multiple times');
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

    function alreadyApplied(prop, _context) {

        // const {kind, name, metadata} = _context;
        // const isStatic = _context.static;

        const propMeta = propertyDecorator.getTypeMetadataIn(prop, _context);

        console.log(propMeta)

        if (typeof propMeta === 'object' && propMeta.typeDecoratorApplied === true) {

            return true;
        }
        else {

            return false;
        }
    }


    // function checkIfMetadataIsSetted(_object, prop) {

    //     if (!_object[REFLECTION]) {

    //         _object[REFLECTION] = new ObjectReflection(_object);
    //     }   

    //     const metadata = _object[REFLECTION];

    //     if (metadata.properties[prop]) {

    //         throw new Error(`@type is applied to ${prop} multiple times`);
    //     }
    // }
}

/**
 * 
 * @param {property_metadata_t} _propMeta 
 * @returns {Function}
 */
function generateAccessorInitializer(_propMeta) {

    const propName = _propMeta.name;
    const {type} = _propMeta;
    return function(initValue) {
        
        if (initValue === undefined || initValue === null) {

            return initValue;
        }

        const wrapper = this[METADATA] ??= {};

        /**@type {metadata_t} */
        const typeMeta = wrapper[TYPE_JS] ??= new metadata_t();

        typeMeta.properties[propName] = _propMeta;

        if (!matchType(type, initValue)) {

            const isStatic = _propMeta.static;

            throw new TypeError(`Initialization of ${isStatic? 'static' : ''}${isStatic ? this.name : this.constructor.name}.${propName} not match type [${type.name}]`);
        }

        return initValue;
    }
}

function generateAccessorSetter(_propMeta, _defaultSet) {

    const {type} = _propMeta;

    return function(_value) {
        
        if (!matchType(type, _value)) {

            const isStatic = _propMeta.static;
            const propName = _propMeta.name;

            throw new TypeError(`Cannot set value to${(isStatic? ' static' : '') + ' attribute '}${isStatic ? this.name : this.constructor.name}.${propName} that is not type of [${type.name}]`);
        }

        return _defaultSet.call(this, _value);
    }
}

function handleAccessor(_accessor, context, _abstract) {

    const defaultGetter = _accessor.get;
    const defaultSetter = _accessor.set;

    const {static, private, name} = context;

    const initPropMeta = propertyDecorator.outerMetadataExist(context) ? 
                    propertyDecorator.initMetadata(context) 
                    : typeMetadata.metaOf(defaultGetter) || new property_metadata_t();

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
 
    const initializer = generateAccessorInitializer(initPropMeta);

    // const propMeta = typeMetadata.metaOf(init);

    // propMeta.typeDecoratorApplied = true;
    // propMeta.type = _abstract;

    return {
        get: defaultGetter,
        set: generateAccessorSetter(initPropMeta, defaultSetter),
        init: generateAccessorInitializer(initPropMeta)
    }

}

function handleTypeForMethod(_method, context, _abstract) { 
    
    if (typeof _method !== 'function') {

        return;
    }

    /**@type {property_metadata_t} */
    const propMeta = propertyDecorator.initMetadata(context);

    if (!propMeta) {

        return;
    }

    const decoratedMethod = function checkReturnTypeAndResolve() {

        const result = _method.call(this, ...arguments);

        const invocationContext = {
            expectReturnType: _abstract, 
            isAsync: false,
        }

        if (result instanceof Promise) {

            invocationContext.isAsync = true;

            result.then(checkReturnValue.bind(invocationContext));
        }
        else {

            checkReturnValue.call(invocationContext, result);
        }

        return result;
    }

    //const methodTypeMeta = placeTypeToMethodMetadata(_method, context);

    decoratedMethod[METADATA] = _method[METADATA];

    propMeta.type = _abstract;
    propMeta.typeDecoratorApplied = true;

    // methodTypeMeta.type = _abstract;

    return decoratedMethod;
}

/**
 * 
 * @param {*} _target 
 * @returns {metadata_t | property_metadata_t}
 */
function placeTypeDummyMetadata(_target) {

    if (!_target) {

        return;
    }

    if (_target instanceof Object) {

        _target[METADATA] ??= {};

        _target[METADATA][TYPE_JS] ??= new property_metadata_t();
    
        return _target[METADATA][TYPE_JS]
    }

    return; 
}

function placeTypeToMethodMetadata(_target, context) {

    /**@type {property_metadata_t} */
    const meta = placeTypeDummyMetadata(_target);

    if (meta instanceof property_metadata_t) {
        
        const {static, private, name, access} = context;

        meta.isMethod = true;
        meta.static = static;
        meta.private = private;
        meta.name = name;

        return meta;
    }
}

function matchType(_type, value) {

    const transferToBoxedPrimitive = {
        'string': 'String',
        'boolean': 'Boolean',
        'number': 'Number',
        'bigint': 'BigInt'
    }

    // if _type is annotated as primitive types
    // is must be a boxed primitive
    if (isPrimitive(_type) && isPrimitive(value)) {

        if (_type.name === value?.name) {
            console.log(1)
            return true;
        }

        const strictType = transferToBoxedPrimitive[typeof value];
        
        return strictType === _type.name;
    }
    else {

        return (value[IS_CHECKABLE]) ? value.__is(_type) : value instanceof _type;
    }
}

function preventImmediateValue(_target) {

    if (typeof _target !== 'function' && !_target.prototype) {

        throw new TypeError('require a constructor, immediate value given');
    }
}

function checkReturnValue(result) {

    const {expectReturnType, isAsync} = this;

    let error = false;

    if (result === undefined || result === null) {

        error = true;
    }

    if (!matchType(expectReturnType, result)) {
        
        error = true;
    }

    if (error) {

        throw new TypeError('The return value of function is not match return type');
    }
    
    return result;
}



module.exports = type;