/**
 * *reflectype/src/reflection/metadata.js
 * 
 * Defines data structures that represent the raw metadata for classes.
 */

const { isInstantiableOrFail, isInstantiable, isObject, isObjectLike } = require('../libs/type.js');

/**
 * @typedef {import('../interface/interfacePrototype.js')} InterfacePrototype
 */

/** @type {Symbol} */
const METADATA = Symbol.metadata || Symbol.for('Symbol.metadata') || Symbol(Date.now());
const TYPE_JS = Symbol(Date.now());

const PROP_META_INITIALIZED = {
    configurable: false,
    enumerable: true,
    writable: false,
    value: true            
};

function owner_metadata_t() {
    /**
     * @type {metadata_t}
     */
    this.typeMeta = undefined;
}

/**
 * @class
 * 
 * @param {Function} _abstract 
 * @param {metadata_t} _ref 
 */
function metadata_t(_abstract, _ref) {
    /**
     * The class that is annotated.
     * When shallow copy from another, clone everything except "owner" and "abstract"
     * 
     * @type {Function}
     */
    this.abstract = isInstantiable(_abstract) ? _abstract : undefined;
    /**@type {Object} */
    this.properties = Object.assign({}, _ref?.properties);

    /**@type {InterfacePrototype} */
    this.interfaces = _ref?.interfaces?.clone();

    /**
     * Metadata about the prototype of the annotated class
     * 
     * @type {prototype_metadata_t} 
     */
    this.prototype = new prototype_metadata_t(_ref, this.abstract);
    this.prototype.owner = this.loopback;

    /**
     * A reference for its dependent metadata objects to resolve their original
     * owner. This property will be delete permanently when resolution of the entire
     * typeMeta is resolved.
     * 
     * @type {owner_metadata_t}
     */
    this.loopback = new owner_metadata_t();
    this.loopback.typeMeta = this;
}

/**
 * 
 * @param {metadata_t} _ref 
 * @param {Function} _ownerAbstract
 */
function prototype_metadata_t(_ref, _ownerAbstract) {
    
    const _refProto = _ref?.prototype;

    /**
     * @type {Object} 
     */
    this.properties = Object.assign({}, _refProto?.properties);

    /**
     * @type {owner_metadata_t}
     */
    this.owner; //= new owner_metadata_t();
}


/**
 * @class
 * @param {property_metadata_t} _ref 
 * @param {metadata_t} _ownerTypeMeta
 */
function property_metadata_t(_ref, _ownerTypeMeta) {

    /**@type {boolean} */
    this.private = _ref?.private;
    /**@type {boolean} */
    this.static = _ref?.static;
    /**@type {Iterable<any>} */
    this.defaultParamsType = _ref?.defaultParamsType;
    /**@type {boolean} */
    this.isMethod = _ref?.isMethod;
    /**@type {string|Symbol} */
    this.name = _ref?.name;

    /**
     * Indicates the type of the property's value.
     * When the specific property is annotated as method,
     * "type" would refers to the return type of the method.
     * 
     * @type {Function} 
     */
    this.type = _ref?.type;

    /**
     * If a property is not a method, "value" would be the value of the property.
     * Otherwise, "value" would refers to default arguments of the method.
     * 
     * @type {any} 
     */
    this.value = _ref?.value;

    /**
     * When a property is not annotated as a method, "allowNull" means this property's value 
     * could be passed as null like. Otherwise, "allowNull" refers to the annotated method's
     * return value's type could be null like.
     * 
     * @type {boolean}
     */
    this.allowNull = _ref?.allowNull;

    /**
     * This field is for configuration, not need to be copied from the _ref
     * 
     * @type {boolean}
     */
    this.isInitialized = undefined;

    /**
     * 
     * @type {owner_metadata_t}
     */
    this.owner; //= new owner_metadata_t();

    /**
     *  Refers to the context of a decorator which initialize the propMeta.
     *  This property is used for decorator initialization when creating objects.
     *  
     *  @type {Object}
     */
    this.decoratorContext = undefined;
}

/**
 * 
 * @param {prototype_metadata_t|property_metadata_t} _meta 
 * @param {Object} options
 * @param {Function} options.abstract 
 * @param {Object} options.typeMeta
 */
function setWrapper(_meta, {abstract, typeMeta} = {}) {

    switch(_meta?.constructor) {
        case property_metadata_t:
            break;
        case prototype_metadata_t:
            break;
        default: 
            return;
    }
    
    const wrapper = !isInstantiable(abstract) ? 
                    typeMeta?.ownerClassWrapper
                    : abstract[METADATA];

    _meta.owner.classWrapper = typeof wrapper === 'object' ? wrapper : undefined; 
}

/**
 * 
 * @param {Object|Function} _unknown 
 * @returns {metadata_t|property_metadata_t}
 */
function metaOf(_unknown) {

    const wrapper = wrapperOf(_unknown);

    return typeof wrapper === 'object' ? wrapper[TYPE_JS] : undefined;
}

function wrapperOf(_unknown) {

    return isObjectLike(_unknown) ? _unknown[METADATA] || _unknown.metadata : undefined;
}

module.exports = {
    METADATA, 
    TYPE_JS, 
    PROP_META_INITIALIZED,
    metaOf, 
    wrapperOf,
    //setWrapper,
    metadata_t,
    property_metadata_t, 
    owner_metadata_t,
    prototype_metadata_t
};