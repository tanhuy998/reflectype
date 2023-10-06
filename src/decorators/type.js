const propertyDecorator = require('../libs/propertyDecorator.js');
const {METADATA} = require('../reflection/metadata.js');
const Interface = require('../interface/interface.js');
const isPrimitive = require('../utils/isPrimitive.js');
const typeMetadata = require('../reflection/metadata.js');

const {TYPE_JS, property_metadata_t, metadata_t} = require('../reflection/metadata.js');

function type(_abstract) {

    preventImmediateValue(_abstract);

    const isInterface = _abstract.__proto__ === Interface;

    //return handle;

    // return function(instance, context) {

    //     return handle(instance, context); 
    // }

    return function handle(prop, context) {
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

        if (typeof propMeta === 'object' && propMeta.typeDecoratorApplied === true) {

            return true;
        }
        else {

            return false;
        }
    }
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

    const {type, allowNull} = _propMeta;
    return function(_value) {

        const isNull = _value === undefined || _value === null;

        if (isNull && _propMeta.allowNull) {

            return _defaultSet.call(this, _value);
        }

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

    /**@type {property_metadata_t} */
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
    initPropMeta.allowNull ??= false;
 
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

        const args = arguments.length !== 0 ? arguments : propMeta.value || [];

        const result = _method.call(this, ...args);

        const invocationContext = {
            expectReturnType: _abstract, 
            isAsync: false,
        }

        if (result instanceof Promise) {

            invocationContext.isAsync = true;

            result.then(checkReturnValueWith(_abstract, propMeta.allowNull));
        }
        else {

            checkReturnValueWith(_abstract, propMeta.allowNull)(result);
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

function checkReturnValueWith(expectReturnType, allowNull = false) {

    return function (returnValue) {

        //const { expectReturnType, isAsync } = this;

        let error = false;

        const isNull = returnValue === undefined || returnValue === null;

        if (isNull) {
            
            if (allowNull) {

                return returnValue;
            }
            else {

                error = true;
            }
        }

        if (!matchType(expectReturnType, returnValue)) {

            error = true;
        }

        if (error) {

            throw new TypeError('The return value of function is not match return type');
        }

        return returnValue;
    }
}



module.exports = type;