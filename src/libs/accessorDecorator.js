const { metaOf, property_metadata_t, metadata_t} = require('../reflection/metadata.js');
const { METADATA, TYPE_JS } = require('../constants.js');
//const isPrimitive = require('../utils/isPrimitive.js');
const {initDecoratorFootPrint, decoratorHasFootPrint, setDecoratorFootPrint} = require('./footPrint.js');
const matchType = require('./matchType.js');
const { DECORATED_VALUE } = require('./constant.js');
const Void = require('../type/void');
const AccesorDecoratorSetterNotMatchTypeError = require('../error/accessorDecoratorSetterNotMatchTypeError.js');


// will be obsolete
function resolveAccessorTypeMetadata(_accessor, _propMeta) {

    const { get } = _accessor;

    get[METADATA] ??= {};
    get[METADATA][TYPE_JS] ??= _propMeta;

    const actualMeta = metaOf(get);
    actualMeta.isMethod = false;

    initDecoratorFootPrint(actualMeta);

    get[METADATA] ??= {};

    return get[METADATA][TYPE_JS] ??= actualMeta;
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

        const wrapper = this[METADATA] ??= {};

        /**@type {metadata_t} */
        const typeMeta = wrapper[TYPE_JS] ??= new metadata_t();

        typeMeta.properties[propName] = _propMeta;

        if (initValue === undefined || initValue === null) {

            return initValue;
        }

        if (!matchType(type, initValue)) {

            const isStatic = _propMeta.static;

            throw new TypeError(`Initialization of ${isStatic? 'static' : ''}${isStatic ? this.name : this.constructor.name}.${propName} not match type [${type.name}]`);
        }

        return initValue;
    }
}

/**
 * 
 * @param {property_metadata_t} _propMeta 
 * @param {Function} _defaultSet 
 * @returns 
 */
function generateAccessorSetter(_propMeta, _defaultSet) {

    return function (_value) {

        const isNull = _value === undefined || _value === null;

        if (isNull && _propMeta.allowNull) {

            return _defaultSet.call(this, _value)
        }
        
        if (!matchType(_propMeta.type, _value)) {

            throw new AccesorDecoratorSetterNotMatchTypeError(_value, _propMeta);
        }

        return _defaultSet.call(this, _value);
    }
}


/**
 * 
 * @param {Object} _accessor 
 * @param {Object} context 
 * @param {property_metadata_t} initPropMeta 
 * @returns 
 */
function decorateAccessor(_accessor, context, initPropMeta) {

    if (!initPropMeta) {

        return;
    }

    if (decoratorHasFootPrint(_accessor, context, DECORATED_VALUE)) {
        
        return;
    }

    const propType = initPropMeta.type;

    if (propType === Void) {

        throw new TypeError('class field could not be type of [Void]');
    }

    const {addInitializer, name} = context;

    // addInitializer(function() {

    //     if (initPropMeta.initialized === true) {

    //         return;
    //     } 

    //     this[name];

    //     initPropMeta.initialized = true;
    // })
    
    setDecoratorFootPrint(_accessor, context, DECORATED_VALUE, {
        init: generateAccessorInitializer(initPropMeta),
        set: generateAccessorSetter(initPropMeta, _accessor.set),
        get: _accessor.get
    });
}

module.exports = {resolveAccessorTypeMetadata, generateAccessorInitializer, generateAccessorSetter, decorateAccessor};