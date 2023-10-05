const propertyDecorator = require('../libs/propertyDecorator.js');
const { METADATA } = require('../reflection/metadata.js');
const Interface = require('../interface/interface.js');
const isPrimitive = require('../utils/isPrimitive.js');

const {TYPE_JS, property_metadata_t, metadata_t} = require('../reflection/metadata.js');
function type(_abstract) {

    preventImmediateValue(_abstract);

    const isInterface = _abstract.__proto__ === Interface;

    return function(instance, context) {

        return handle(instance, context); 
    }

    function handle(prop, context) {
        const {kind, name} = context;

        switch(kind) {

            case 'accessor':
                return handleAccessor(prop, context);
            case 'method':
                return hanldeMethod(prop, context);
            default:
                throw new Error('Decorator @type just applied to auto assessor, add \'accessor\' syntax before the class property');
        }
    }

    // function handleAccessor(prop, context) {

    //     const getter = prop.get;
    //     const setter = prop.set;

    //     const {static, private, name} = context;

    //     const variable = new Variable(_abstract, undefined, name, {
    //         isStatic: static,
    //         isPrivate: private,
    //     });

    //     return {
    //         get() {

    //             const currentValue = variable.getValue();

    //             const notNullAndUndefined = currentValue !== undefined && currentValue !== null;

    //             const propValue = notNullAndUndefined ? currentValue : variable;

    //             return new Proxy(propValue, {
    //                 referenceObj: this,
    //                 get: function(target, prop) {

    //                     const propertyMetadata = this.referenceObj[REFLECTION].properties[context.name];

    //                     if (prop === 'type') {

    //                         return propertyMetadata.type;
    //                     }

    //                     if (target instanceof Variable) {

    //                         throw new Error(`Property ${prop} is null or undefined`);
    //                     }

    //                     return target[prop];
    //                 }
    //             });
    //         },
    //         set(_value) {

    //             return variable.setValue(_value);
    //         },
    //         init(intiValue) {

    //             checkIfMetadataIsSetted(this, name);

    //             this[REFLECTION].setProperty(context);

    //             this[REFLECTION].properties[context.name].setType(_abstract)
    //             //this[REFLECTION].typeHintedProperties.get(name).setType(_abstract);

    //             variable.setClass(_abstract);

    //             variable.setValue(intiValue);

    //             return variable;
    //         }
    //     }
    // }

    function hanldeMethod(_method, context) {

        function checkReturnTypeAndResolve(target, _this, _args = []) {

            const result = target.call(_this, ..._args);

            const error = new TypeError('The return value of function is not match return type');
            
            if (result === undefined || result === null) {

                throw error;
            }

            const matchType = isPrimitive(result) ? (isPrimitive(_abstract) ? _abstract(result) : false)
                                : (result[IS_CHECKABLE]) ? result.__is(_abstract) : result instanceof _abstract;

            if (!matchType) {

                throw error;
            }

            return result;
        }
        
        if (typeof _method !== 'function') {

            return;
        }

        const metadata = propertyDecorator.initPropMetadata(context);

        if (!metadata) {

            return;
        }

        const decoratedMethod = function() {

            return checkReturnTypeAndResolve(_method, this, ...arguments);
        }

        const methodMeta = placeMethodMetadata(_method, context);

        decoratedMethod[METADATA] = metadata;

        return decoratedMethod;
    }

    function checkIfMetadataIsSetted(_object, prop) {

        if (!_object[REFLECTION]) {

            _object[REFLECTION] = new ObjectReflection(_object);
        }   

        const metadata = _object[REFLECTION];

        if (metadata.properties[prop]) {

            throw new Error(`@type is applied to ${prop} multiple times`);
        }
    }
}

/**
 * 
 * @param {*} _target 
 * @returns {metadata_t | property_metadata_t}
 */
function placeTypeMetadata(_target) {

    if (!_target) {

        return;
    }

    _target[METADATA] ??= {};

    _target[METADATA][TYPE_JS] ??= new property_metadata_t();

    return _target[METADATA][TYPE_JS]
}

function placeMethodMetadata(_target, context) {

    /**@type {property_metadata_t} */
    const meta = placeTypeMetadata(_target);

    if (meta instanceof property_metadata_t) {

        const {static, private, name, access} = context;

        meta.isMethod = true;
        meta.static = static;
        meta.private = private;
        meta.name = name;

        return meta;
    }
}

function preventImmediateValue(_target) {

    if (typeof _target !== 'function' && !_target.prototype) {

        throw new TypeError('require a constructor, immediate value given');
    }
}



module.exports = type;