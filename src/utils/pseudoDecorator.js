const { isNonIterableObjectKey } = require("../libs/type");

const DECORATOR_KINDS = [
    "class",
    "method",
    "getter",
    "setter",
    "field",
    "accessor",
]

const KIND_CLASS = 'class';
const KIND_METHOD = 'method';
const KIND_GETTER = 'getter';
const KIND_SETTER = 'setter';
const KIND_FIELD = 'field';
const KIND_ACCESSOR = 'accessor'; 
const KIND_PARAMETER = 'parameter';


module.exports = {
    generateAutoAccessorDecoratorContext,
    generateMethodDecoratorContext,
    generatePseudoParamDecoratorContext,
    pseudo_decorator_context_t,
    pseudo_parameter_decorator_context_t
}

/**
 * 
 * @param {ps_decorator_context_t} ref 
 */
function pseudo_decorator_context_t(ref) {

    /**
     * @type {string}
     */
    this.kind = ref?.kind;

    /**
     * @type {string}
     */
    this.name = ref?.name;

    /**
     * @type {Object}
     */
    this.access = ref?.access;

    /**
     * @type {boolean}
     */
    this.private = ref?.private;

    /**
     * @type {boolean}
     */
    this.static = ref?.static;

    /**
     * @type {Function}
     */
    this.addInitializer = ref?.addInitializer;

    /**
     * @type {Object}
     */
    this.metadata;
}

function pseudo_parameter_decorator_context_t() {

    /**
     * @type {string}
     */
    this.kind = KIND_PARAMETER;
    /**
     * @type {string}
     */
    this.name;
    /**
     * @type {number}
     */
    this.index;
    /**
     * @type {boolean}
     */
    this.rest;
    /**
     * @type {pseudo_decorator_context_t}
     */
    this.function;
    /**
     * @type {Object}
     */
    this.metadata;
    /**
     * @type {Function}
     */
    this.addInitializer;
}

// function ps_decorator_context_accessor_t(ref) {

//     this.get;
//     this.set;
// }

/**
 * 
 * @param {Object} target 
 * @param {decorator_context_t} options 
 */
function generateMethodDecoratorContext(options) {

    const context = new pseudo_decorator_context_t(options);
    context.kind = KIND_METHOD;

    return context;
}

/**
 * 
 * @param {*} options 
 * @returns 
 */
function generateAutoAccessorDecoratorContext(options) {

    const context = new pseudo_decorator_context_t(options);
    context.kind = KIND_ACCESSOR;

    return context;
}


/**
 * 
 * @param {pseudo_decorator_context_t} context 
 */
function generatePseudoParamDecoratorContext(context, { name, index, rest } = {}) {

    if (typeof index !== 'number') {

        throw new Error('param index must be number.');
    }

    if (
        !isNonIterableObjectKey(name) &&
        name !== undefined && name !== null
    ) {

        throw new Error('param name must be either string, symbol or nullable value.');
    }

    const pseudoContext = new pseudo_parameter_decorator_context_t();
    
    pseudoContext.function = context;
    pseudoContext.metadata = context.metadata;
    pseudoContext.addInitializer = context.addInitializer;
    pseudoContext.name = name;
    pseudoContext.index = index;
    pseudoContext.rest = typeof rest === 'boolean' ? rest : false;
    
    return pseudoContext;
}

function validateOptions() {


}