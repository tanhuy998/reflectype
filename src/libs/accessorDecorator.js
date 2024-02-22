const { property_metadata_t} = require('../reflection/metadata.js');
const {decoratorHasFootPrint, setDecoratorFootPrint} = require('./footPrint.js');
const matchType = require('./matchType.js');
const { DECORATED_VALUE } = require('./constant.js');
const Void = require('../type/void');
const AccesorDecoratorSetterNotMatchTypeError = require('../error/accessorDecoratorSetterNotMatchTypeError.js');
const { static_cast } = require('./casting.lib.js');

module.exports = {
    generateAccessorInitializer, 
    generateAccessorSetter, 
    decorateAccessor
};

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

            throw new AccesorDecoratorSetterNotMatchTypeError({
                value: _value, 
                metadata: _propMeta
            });
        }

        return _defaultSet.call(this, _value);
    }
}

/**
 * 
 * @param {property_metadata_t} _propMeta 
 * @param {Function} defaultGet 
 * @returns 
 */
function generateAccessorGetter(_propMeta, defaultGet) {

    return function() {

        const ret = defaultGet.call(this);

        return static_cast(_propMeta.type, ret);
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
    
    setDecoratorFootPrint(_accessor, context, DECORATED_VALUE, {
        init: generateAccessorInitializer(initPropMeta),
        set: generateAccessorSetter(initPropMeta, _accessor.set),
        //get: _accessor.get
        get: generateAccessorGetter(initPropMeta, _accessor.get)
    });
}
