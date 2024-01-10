/**
 * *reflectype/src/reflection/metadata.js
 * 
 * Defines data structures that represent the raw metadata for classes.
 */

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

    this.classWrapper = undefined;
    this.typeMeta = undefined;
    this.isResolutionResolved = false;
}

/**
 * @class
 * 
 * @param {Function} _abstract 
 * @param {metadata_t} _ref 
 */
function metadata_t(_abstract, _ref) {

    /**
     * The class that is annotated
     * 
     * @type {Function}
     */
    this.abstract = _ref?.abstract ?? _abstract;
    /**@type {Object} */
    this.properties = Object.assign({}, _ref?.properties);

    /**@type {InterfacePrototype} */
    this.interfaces = _ref?.interfaces?.clone();

    /**
     * Metadata about the prototype of the annotated class
     * 
     * @type {prototype_metadata_t} 
     */
    this.prototype = new prototype_metadata_t(_ref);

    /**
     *  When "isInitialized" equals to false,
     *  decoratorContext will be set to the decorator context which is 
     *  applied by a particular method decorator 
     *  
     *  @type {Object}
     */
    this.ownerClassWrapper = undefined;

    this.isResolutionResolved = false;
}

/**
 * 
 * @param {metadata_t} _ref 
 */
function prototype_metadata_t(_ref) {

    /**
     * The class that is annotated
     * 
     * @type {Function}
     */
    this.abstract = _ref?.abstract;
    
    const _refProto = _ref?.prototype;

    /**@type {Object} */
    this.properties = Object.assign({}, _refProto?.properties);

    this.owner = new owner_metadata_t();
}


/**
 * @class
 * @param {property_metadata_t} _ref 
 */
function property_metadata_t(_ref) {

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

    this.owner = new owner_metadata_t();

    /**
     *  When "isInitialized" equals to false,
     *  decoratorContext will be set to the decorator context which is 
     *  applied by a particular method decorator 
     *  
     *  @type {Object}
     */
    this.decoratorContext = undefined;
}


/**
 * 
 * @param {Object|Function} _unknown 
 * @returns {metadata_t|property_metadata_t}
 */
function metaOf(_unknown) {

    if (!_unknown) {

        return;
    }

    const wrapper = _unknown[METADATA];

    return typeof wrapper === 'object' ? wrapper[TYPE_JS] : undefined;
}


function isAbstract(_unknown) {

    return typeof _unknown === 'function' && typeof _unknown.prototype === 'object';
}

module.exports = {
    METADATA, 
    TYPE_JS, 
    PROP_META_INITIALIZED,
    metaOf, 
    metadata_t,
    property_metadata_t, 
    owner_metadata_t,
    prototype_metadata_t
};