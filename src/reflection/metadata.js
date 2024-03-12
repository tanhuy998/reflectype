/**
 * *reflectype/src/reflection/metadata.js
 * 
 * Defines data structures that represent the raw metadata for classes.
 */

const { isInstantiable, isObjectLike } = require('../libs/type.js');

/**
 * @typedef {import('../interface/interfacePrototype.js')} InterfacePrototype
 */

/** @type {Symbol} */
const METADATA = Symbol.metadata ??= Symbol.for('Symbol.metadata') || Symbol('Symbol.metadata'); //|| Symbol(Date.now());
const TYPE_JS = Symbol(Date.now());

const PROP_META_INITIALIZED = {
    configurable: false,
    enumerable: true,
    writable: false,
    value: true            
};

module.exports = {
    METADATA, 
    TYPE_JS, 
    PROP_META_INITIALIZED,
    metaOf, 
    wrapperOf,
    metadata_t,
    property_metadata_t, 
    function_metadata_t,
    owner_metadata_t,
    prototype_metadata_t,
    parameter_metadata_t,
    function_variant_param_node_metadata_t,
    function_variant_param_node_endpoint_metadata_t,
    method_variant_map_metadata_t,
    method_variant_mapping_table_metadata_t
    //function_variant_origin_map_metadata_t,
};

/**
 *  
 */
function owner_metadata_t() {
    /**
     * @type {metadata_t}
     */
    this.typeMeta = undefined;
    /**
     * @type {Object}
     */
    this.decoratorContext;
}

/**
 * 
 * @param {method_variant_map_metadata_t} ref 
 */
function method_variant_map_metadata_t(ref) {
   
    /**
     * @type {method_variant_mapping_table_metadata_t}
     */
    this.static = new method_variant_mapping_table_metadata_t(ref?.static); //= new Map();

    /**
     * @type {method_variant_mapping_table_metadata_t}
     */
    this._prototype = new method_variant_mapping_table_metadata_t(ref?._prototype); //= new Map();
}

/**
 * 
 * @param {method_variant_mapping_table_metadata_t} ref 
 */
function method_variant_mapping_table_metadata_t(ref) {

    /**
     * stastisticTable is evaluated when establishing metadata resolution
     * 
     * @type {Map<Function, number>}
     */
    this.statisticTable = ref?.statisticTable;// = new Map();

    /**
     * contain generic propMeta of decorated methods,
     * mappingTable is evaluated when method decorator decorates the method
     * 
     * @type {Map<string|symbol, property_metadata_t>}
     */
    this.mappingTable = new Map(ref?.mappingTable.entries());

    /**
     * for manipulating nullable function signature
     * 
     * @type {function_variant_param_node_metadata_t}
     */
    this.localTrie = ref?.localTrie || new function_variant_param_node_metadata_t();
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

    /**
     * @type {method_variant_map_metadata_t}
     */
    //this.methodVariantMaps = _ref?.methodVariantMaps || new method_variant_map_metadata_t();
    this.methodVariantMaps = new method_variant_map_metadata_t(_ref?.methodVariantMaps);

    /**@type {InterfacePrototype} */
    this.interfaces = _ref?.interfaces?.clone();

    /**
     *  Holds metadata about a class's constructor
     * 
     *  @type {function_metadata_t}
     */
    this._constructor;

    /**
     * Metadata about the prototype of the annotated class
     * 
     * @type {prototype_metadata_t} 
     */
    this._prototype = new prototype_metadata_t(_ref, this.abstract);
    this._prototype.owner = this.loopback;

    /**
     * loopback for this._prototype
     * 
     * @type {prototype_metadata_t}
     */
    this.prototype = this._prototype;

    /**
     * A reference for its dependent metadata objects to resolve their original
     * owner. This property will be delete permanently when resolution of the entire
     * typeMeta is resolved.
     * 
     * @type {owner_metadata_t}
     */
    this.loopback = new owner_metadata_t();
    this.loopback.typeMeta = this;
    this._prototype.owner = this.loopback;

    /**
     * @type {Error}
     */
    this.pendingError;
}

/**
 * 
 * @param {metadata_t} _ref 
 * @param {Function} _ownerAbstract
 */
function prototype_metadata_t(_ref, _ownerAbstract) {
    
    const _refProto = _ref?._prototype;

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
 * 
 * @param {property_metadata_t} _owner
 */
function function_metadata_t(_owner) {

    /**
     * @type {Array<string>}
     */
    this.paramsName;

    /**
     * @type {property_metadata_t}
     */
    this.owner = _owner;

    /**
     * @type {any}
     */
    this.defaultArguments = _owner?.value;

    /**
     * @type {Function}
     */
    this.returnType + _owner?.type;

    /**
     * @type {string|symbol}
     */
    this.name = _owner?.name;
    /***
     * @type {Array<Function>}
     */
    this.defaultParamsType;

    /**
     * @type {Object}
     */
    this.parameters = {};

    this.paramList = [];

    /**
     * @type {boolean}
     */
    this.allowNull;

    /**
     * @type {boolean}
     */
    this.isDiscovered;

    /**
     * @type {Object}
     */
    this.params = {};

    // /**
    //  * Indicate last manipulated variant tree node
    //  * 
    //  * @type {function_variant_param_node_metadata_t}
    //  */
    // this.lastVariantTrieNode;

    // /**
    //  * Indicate the root node of the function variants.
    //  * 
    //  * @type {function_variant_param_node_metadata_t?}
    //  */
    // this.variantTrie;

    /**
     * Indicate the current variant method is virtual method
     * and can be overriden by it's similar derived class's 
     * signature method.
     * 
     * @type {boolean}
     */
    this.allowOverride = false;
}

function function_variant_param_node_endpoint_metadata_t() {
    /**
     * 
     * @type {Map<function_metadata_t, function_metadata_t>}
     */
    this.vTable = new Map();

    /**
     * @type {Number}
     */
    this.depth;
}

/**
 * 
 * @param {function_variant_param_node_metadata_t} ref 
 */
function function_variant_param_node_metadata_t (ref) {

    /**
     * @type {Map<Function, function_variant_param_node_metadata_t>}
     */
    this.current = new Map();

    /**
     * @type {number};
     */
    this.depth = ref?.depth + 1 || 0;

    /**
     * To indicate that the current resolution is has any type,
     * so parameter types look up progresss will find skip the exact
     * match type of the argument. if unmatch, the look up progress
     * will choose this node.
     * 
     * @type {boolean}
     */
    this.isCompliant;

    // /**
    //  * @type {parameter_metadata_t}
    //  */
    // this.paramMeta;

    /**
     * Indicating that the current depth has Type that is not Any and 
     * allow null
     * @type {boolean}
     */
    this.allowNul;

    /**
     * To indicate the end of parameter list of a varient of the 
     * overloaded method.
     * 
     * @type {function_variant_param_node_endpoint_metadata_t}
     */
    this.endpoint;
}

// function function_variant_origin_map_metadata_t() {

    
// }

function parameter_metadata_t(_owner) {

    /**
     * @type {string|symbol}
     */
    this.paramName;

    /**
     * @type {boolean}
     */
    this.allowNull = false;

    /**
     * @type {Function}
     */
    this.type;

    /**
     * @type {number}
     */
    this.index;

    /**
     * Indicates if the parameter is a rest param
     * 
     * @type {boolean}
     */
    this.rest;

    /**
     * @type {any}
     */
    this.defaultValue;

    /**
     * @type {function_metadata_t}
     */
    this.owner = _owner; 
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
     * For resolving metadata resolution.
     * Is manipulated by the metadata tracing progress
     * when initializing propMeta during first applied
     * decorator.
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

    
    // /**
    //  * @type {boolean}
    //  */
    // //this.isDiscovered = undefined;
    // **@type {Array<any>} */
    // this.defaultParamsType = _ref?.defaultParamsType;
    // **@type {Array<string>} */
    // this.paramsName;

    /**
     * If the current property is kind of method. This field
     * will be evaluated to store extra metadata about the 
     * function object.
     * 
     * @type {function_metadata_t}
     */
    this.functionMeta;
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