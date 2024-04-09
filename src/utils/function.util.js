const { function_metadata_t, parameter_metadata_t } = require("../reflection/metadata");
const { 
    REGEX_ES6_CLASS_DETECT, 
    REGEX_ES6_CONSTRUCTOR_DETECT, 
    REGEX_FUNCTION_BODY_DETECT, 
    REGEX_FUNCTION_DETECT, 
    REGEX_DEFAULT_ARG, 
    REGEX_PARAM_SEPERATOR, 
    REGEX_DECORATOR_DETECT,
    REGEX_ES6_CONSTRUCTOR_EXTRACT,
    REGEX_WHITE_SPACE,
    REGEX_REST_PARAM_DETECT,
    REGEX_ES6_METHOD_DETECT
} = require("./constant");

const config = require('../../config.json');

const ES6_CONSTRUCTOR_PARAMS = 1;
const FUNCTION_PARAMS = 2;
const FIRST = 0;
const EMPTY_STRING = '';

module.exports = {
    extractFunctionInformations,
    extractClassConstructorInformations,
    extractClassConstructorInfoBaseOnConfig,
}

function extractClassConstructorInfoBaseOnConfig(_class) {

    return config.reflectypeOfficialDecorator === true ? 
            extractClassConstructorInformations(_class)
            : extractFunctionInformations(_class);
}

/**
 *  @param {Function} _class
 */
function extractClassConstructorInformations(_class) {
    
    if (typeof _class !== 'function') {

        return undefined;
    }
    
    const str = _class.toString();
    const isES6 = str.match(REGEX_ES6_CLASS_DETECT);

    if (!isES6) {

        return extractFunctionInformations(_class);
    }

    const match = str.match(REGEX_ES6_CONSTRUCTOR_EXTRACT);
    
    if (!match) {

        return undefined;
    }

    const paramStr = match[0].replace(REGEX_FUNCTION_BODY_DETECT, EMPTY_STRING)
                            .match(REGEX_ES6_CONSTRUCTOR_DETECT)
                            ?.[ES6_CONSTRUCTOR_PARAMS];

    return resolveFunctionMeta(paramStr, _class);
}

/**
 * 
 * @param {Function} _func 
 * @returns {function_metadata_t}
 */
function extractFunctionInformations(_func) {
    
    if (typeof _func !== 'function') {
        
        return undefined;
    }

    const str = _func.toString();
    let match = str.replace(REGEX_FUNCTION_BODY_DETECT, EMPTY_STRING);
    match = match.match(REGEX_ES6_METHOD_DETECT);

    return match ? resolveFunctionMeta(match[FUNCTION_PARAMS], _func) : undefined
}

/**
 * 
 * @param {string} paramStr 
 * @param {Function} _func 
 */
function resolveFunctionMeta(paramStr, _func) {

    if (typeof _func !== 'function') {

        return undefined;
    }

    const funcMeta = new function_metadata_t();
    funcMeta.name = _func.name;

    funcMeta.paramsName = resolveParamsName(paramStr);
    funcMeta.isDiscovered = true;

    return funcMeta;
}

/**
 * 
 * @param {string} paramStr 
 * 
 * @return {Array<string>}
 */
function resolveParamsName(paramStr) { 
    
    if (typeof paramStr !== 'string') {

        return undefined;
    }
    
    let paramList = paramStr?.replace(REGEX_DEFAULT_ARG, EMPTY_STRING)
                    ?.replace(REGEX_WHITE_SPACE, EMPTY_STRING)
                    ?.split(REGEX_PARAM_SEPERATOR);
           
    if (config.reflectypeOfficialDecorator === true) {
        /**
         * This section just invoke when decorator feature officially
         * turn on on Javascript because of babel tranform a lot of 
         * information of the original function.
         */
        paramList = paramList?.map(resolveParamsOnOfficialDecoratorRelease);        
    }

    return hasNoParam(paramList) ? [] : paramList;
}

/**
 * 
 * @param {Array<string>} _list 
 * @returns 
 */
function hasNoParam(_list) {

    if (!_list) {

        return true;
    }

    return _list.length === 0 ||
            _list.length === 1 &&
            !_list[FIRST];
}

function resolveParamsOnOfficialDecoratorRelease(str) {

    if (typeof str !== 'string') {

        return str;
    }

    return str.replace(REGEX_DECORATOR_DETECT, EMPTY_STRING)
            .replace(REGEX_REST_PARAM_DETECT, EMPTY_STRING);
    
}

