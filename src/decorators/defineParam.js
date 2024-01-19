const propertyDecorator = require('../libs/propertyDecorator');
const parameterDecorator = require("../libs/parameterDecorator");
const { function_metadata_t, parameter_metadata_t } = require("../reflection/metadata");
const { generatePseudoParamDecoratorContext, pseudo_parameter_decorator_context_t, pseudo_decorator_context_t } = require("../utils/pseudoDecorator");

module.exports = defineParam;

/**
 * A pseudo decorator that emulates the behavior of class method parameter decorator
 * that is described in https://github.com/tc39/proposal-class-method-parameter-decorators.
 * 
 * This decorator must be applied on a method to take effect.
 * 
 * @param {Object} param0 
 * @param {number} param0.index
 * @param {Function|Array<Function>} param0.decorators
 * 
 * @returns 
 */
function defineParam({index, decorators}) {

    decorators = standadizeDecoratorList(decorators);

    return function(_, context) {

        const {kind} = context;

        if (kind !== 'method') {

            throw new Error('invalid use of defineParam()');
        }

        const funcMeta = propertyDecorator.initMetadata(...arguments).functionMeta;
        const pseudoContext = prepareParamDecoratorContext(index, funcMeta, context);

        parameterDecorator.initMetadata(_, pseudoContext);
        iterateParamDecorators(decorators, _, pseudoContext);
    }
}

/**
 * 
 * @param {function_metadata_t} funcMeta 
 * @param {pseudo_decorator_context_t|pseudo_parameter_decorator_context_t} actualContext 
 * @returns 
 */
function prepareParamDecoratorContext(definedIndex, funcMeta, context) {

    return generatePseudoParamDecoratorContext(context, {
        name: funcMeta.paramsName[definedIndex],
        index: definedIndex
    });
}

function standadizeDecoratorList(list) {

    return !Array.isArray(list) ? [list] : list; 
}

/**
 * 
 * @param {Array<Function>} decoratorList 
 * @param {pseudo_parameter_decorator_context_t} context 
 * @param {any} _t
 */
function iterateParamDecorators(decoratorList, _, context) {

    for (const decorator of decoratorList || []) {
        
        decorator(_, context);
    }
}
