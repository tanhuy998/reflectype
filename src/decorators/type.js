const propertyDecorator = require('../libs/propertyDecorator.js');
const {METADATA} = require('../reflection/metadata.js');
const Interface = require('../interface/interface.js');
const isPrimitive = require('../utils/isPrimitive.js');
const typeMetadata = require('../reflection/metadata.js');

const {TYPE_JS, property_metadata_t, metadata_t} = require('../reflection/metadata.js');
const getMetadata = require('../reflection/getMetadata.js');
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

        if (alreadyApplied(context)) {

            throw new Error('cannot assign @type multiple time');
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

    function alreadyApplied(_context) {

        const {kind, name, metadata} = _context;
        const isStatic = _context.static;

        const typeMeta = typeof metadata === 'object' ? metadata[TYPE_JS] : null

        if (!typeMeta) {

            return false;
        }

        const classPropertiesMeta = isStatic ? typeMeta.properties : typeMeta.prototype?.properties;

        if (typeof classPropertiesMeta !== 'object') {
            
            return false;
        }

        const propMeta =  classPropertiesMeta[name] || (kind === 'method') ? propertyDecorator.getMetadata(_context) : undefined;

        if (typeof propMeta !== 'object') {

            return false;
        }

        if (propMeta.type !== undefined || propMeta.type !== null) {

            return true;
        }
    }

    function handleAccessor(prop, context, _abstract) {

        const getter = prop.get;
        const setter = prop.set;

        const {static, private, name} = context;

        return {
            get() {

                
            },
            set(_value) {

                
            },
            init(initValue) {

                const baseClassTypeMetadata = typeMetadata.metaOf(this.constructor);
                //const prototypeMeta = typeof baseClassTypeMetadata === 'object' ? baseClassTypeMetadata : new metadata_t();

                const wrapper = propertyDecorator.initMetadata(context);
                
                wrapper[TYPE_JS] ??= new metadata_t;


                const currentThisPrototype = typeMetadata.metaOf(this) || wrapper[TYPE_JS];

                currentThisPrototype.properties ??= {};

                const {properties} = currentThisPrototype;

                const propMeta = properties[name] ?? new property_metadata_t();

                propMeta.isMethod = false;
                propMeta.type = _abstract
                propMeta.name = name;
                propMeta.private = private;
                propMeta.value = initValue;
                propMeta.static = false;

                properties[name] = propMeta;

                return initValue;
            }
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

function handleTypeForMethod(_method, context, _abstract) { 
    
    if (typeof _method !== 'function') {

        return;
    }

    const metadata = propertyDecorator.initMetadata(context);

    if (!metadata) {

        return;
    }

    const decoratedMethod = function checkReturnTypeAndResolve() {

        const result = _method.call(this, ...arguments);

        const error = new TypeError('The return value of function is not match return type');
        
        if (result === undefined || result === null) {

            throw error;
        }

        if (!matchType(_abstract, result)) {

            throw error;
        }

        return result;
    }

    const methodTypeMeta = placeTypeToMethodMetadata(_method, context);

    decoratedMethod[METADATA] = metadata;

    methodTypeMeta.type = _abstract;

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

    return isPrimitive(value) ? (isPrimitive(_type) ? _type(value) : false)
    : (value[IS_CHECKABLE]) ? value.__is(_type) : value instanceof _type;
}

function preventImmediateValue(_target) {

    if (typeof _target !== 'function' && !_target.prototype) {

        throw new TypeError('require a constructor, immediate value given');
    }
}



module.exports = type;