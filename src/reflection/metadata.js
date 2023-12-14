
/** @type {Symbol} */
const METADATA = Symbol.metadata || Symbol.for('Symbol.metadata') || Symbol(Date.now());
const TYPE_JS = Symbol(Date.now());


/**
 * @typedef {import('../interface/interfacePrototype.js')} InterfacePrototype
 */

/**
 * @class
 * 
 * @param {Function} _abstract 
 * @param {metadata_t} _ref 
 */
function metadata_t(_abstract, _ref) {

    /**@type {Function} */
    this.abstract = _ref?.abstract ?? _abstract;
    /**@type {Object} */
    this.properties = Object.assign({}, _ref?.properties);

    /**@type {InterfacePrototype} */
    this.interfaces = _ref?.interfaces?.clone();
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
    /**@type {Function} */
    this.type = _ref?.type;
    /**@type {any} */
    this.value = _ref?.value;
    /**@type {Iterable<any>} */
    this.defaultParamsType = _ref?.defaultParamsType;
    /**@type {boolean} */
    this.isMethod = _ref?.isMethod;
    /**@type {string|Symbol} */
    this.name = _ref?.name;
    /**@type {boolean} */
    this.allowNull = _ref?.allowNull;

    // this field is for configuration, not need to be copied from the _ref
    /**@type {boolean} */
    this.isInitialized = undefined;
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
    METADATA, TYPE_JS, metaOf, metadata_t, property_metadata_t
};