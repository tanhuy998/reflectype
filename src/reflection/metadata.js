
/** @type {Symbol} */
const METADATA = Symbol.metadata || Symbol.for('Symbol.metadata') || Symbol(Date.now());
const TYPE_JS = Symbol(Date.now());


/**
 * @class
 * 
 * @param {Function} _abstract 
 * @param {metadata_t} _ref 
 */
function metadata_t(_abstract, _ref) {

    this.abstract = _ref?.abstract ?? _abstract;
    this.properties = Object.assign({}, _ref?.properties);

    this.interfaces = _ref?.interfaces?.clone();
}


/**
 * @class
 * @param {property_metadata_t} _ref 
 */
function property_metadata_t(_ref) {

    this.private = _ref?.private;
    this.static = _ref?.static;
    this.type = _ref?.type;
    this.value = _ref?.value;
    this.defaultParamsType = _ref?.defaultParamsType;
    this.isMethod = _ref?.isMethod;
    this.name = _ref?.name;
    this.allowNull = _ref?.allowNull;

    // this field is for configuration, not need to be copied from the _ref
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