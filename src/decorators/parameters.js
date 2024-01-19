const { DECORATED_VALUE } = require("../libs/constant");
const { retrieveDecoratorFootPrintByKey } = require("../libs/footPrint");
const { refreshMeta } = require("../libs/methodDecorator");
const { isDecorator } = require("../libs/type");
const { property_metadata_t, function_metadata_t } = require("../reflection/metadata");
const { markAsDecorator } = require("../utils/decorator/general");
const { prepareParamsDecorator, mapParamsByNames } = require("../utils/decorator/paramsType.util");
const isAbStract = require("../utils/isAbstract");
const defineParam = require("./defineParam");
const type = require("./type");

module.exports = parameters

function parameters(paramsList) {

    if (typeof paramsList !== 'object') {

        throw new Error('paramList must be an object');
    }

    return function parametersDecorator(_, context) {

        markAsDecorator(parametersDecorator);

        const propMeta = prepareParamsDecorator(_, context);

        //mapParamsByNames(paramsList, propMeta);
        refreshMeta(propMeta);
        enumerateDeclaredParams(paramsList, propMeta.functionMeta, _, context);

        return retrieveDecoratorFootPrintByKey(_, context, DECORATED_VALUE);
    }
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

        const i = funcMeta.paramsName.indexOf(paramName);

        defineParam({
            index: i, 
            decorators: resolveParamOptions(paramOptions)
        })( _, context);
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

        if (isAbStract(opt)) {

            return type(opt);
        }

        return opt;
    })
}