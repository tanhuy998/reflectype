const { DECORATED_VALUE } = require("../libs/constant");
const { retrieveDecoratorFootPrintByKey } = require("../libs/footPrint");
const { refreshMeta } = require("../libs/methodDecorator");
const { isDecorator, isAbstract } = require("../libs/type");
const { function_metadata_t } = require("../reflection/metadata");
const { Any } = require("../type");
const { markAsDecorator } = require("../utils/decorator/general");
const { postDecoratorInit } = require("../utils/decorator/parameterDecoratorGeneral.util");
const { prepareParamsDecorator } = require("../utils/decorator/paramsType.util");
const defineParam = require("./defineParam");
const type = require("./type");

module.exports = parameters

function parameters(paramsList) {

    if (typeof paramsList !== 'object') {

        throw new Error('paramList must be an object');
    }

    function parametersDecorator(_, context) {

        const propMeta = prepareParamsDecorator(_, context);

        refreshMeta(propMeta);
        enumerateDeclaredParams(paramsList, propMeta.functionMeta, _, context);
        postDecoratorInit(_, context, propMeta);

        return retrieveDecoratorFootPrintByKey(_, context, DECORATED_VALUE);
    }

    markAsDecorator(parametersDecorator);
    return parametersDecorator;
}

/**
 * 
 * @param {Object} list 
 * @param {function_metadata_t} funcMeta
 * @param {*} _ 
 * @param {*} context 
 */
function enumerateDeclaredParams(list, funcMeta, _, context) {

    for (let [paramName, paramOptions] of Object.entries(list)) {

        paramOptions = !Array.isArray(paramOptions) ? [paramOptions] : paramOptions;
        validateAndTransformParamOptions(paramOptions);

        const i = funcMeta.paramsName.indexOf(paramName);

        defineParam({
            index: i, 
            decorators: paramOptions,
        })( _, context);
    }
}

/**
 * 
 * @param {Array<Function>} options 
 */
function validateAndTransformParamOptions(options) {

    const firstElement = options[0];

    /**
     * First element of the param options must be an abstract
     * if not, unshift the type as [Any]
     */
    if (!isAbstract(firstElement)) {

        options.unshift(type(Any));
    }
    else {

        options[0] = type(firstElement);
    }

    for (let i = 1; i < options.length; ++i) {

        if (typeof options[i] !== 'function') {

            throw new TypeError('invalid param options');
        }
    }
}

/**
 * 
 * @param {Array} options 
 */
function resolveParamOptions(options) {

    return options.map(function(opt) {
        
        if (isDecorator(opt)) {
            
            return opt;
        }
        
        if (isAbstract(opt)) {
            
            return type(opt);
        }
        
        return opt;
    })
}