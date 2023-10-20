const { metaOf, property_metadata_t, metadata_t} = require('../reflection/metadata.js');
const { METADATA, TYPE_JS } = require('../constants.js');
//const isPrimitive = require('../utils/isPrimitive.js');
const initFootPrint = require('./initFootPrint.js');
const matchType = require('./matchType.js');


function resolveAccessorTypeMetadata(_accessor, _propMeta) {

    const { get } = _accessor;

    get[METADATA] ??= {};

    get[METADATA][TYPE_JS] ??= _propMeta;

    const actualMeta = metaOf(get);
    actualMeta.isMethod = false;

    initFootPrint(actualMeta);

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

function generateAccessorSetter(_propMeta, _defaultSet) {

    const {type, allowNull} = _propMeta;
    return function (_value) {

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

module.exports = {resolveAccessorTypeMetadata, generateAccessorInitializer, generateAccessorSetter};