const ArgumentsNotMatchError = require('../error/argumentsNotMatchError.js');
const { matchType, isObject, isAbstract, isValuable } = require('./type.js');

/**
 * @typedef {import('../reflection/metadata.js').property_metadata_t} property_metadata_t
 * @typedef {impot('../reflection/metadata.js').function_metadata_t} function_metadata_t
 * @typedef {impot('../reflection/metadata.js').parameter_metadata_t} parameter_metadata_t
 */

module.exports = {
    compareArgsWithType
};

/**
 * 
 * @param {property_metadata_t} _propMeta 
 */
function compareArgsWithType(_propMeta, _args = []) {

    if (!_propMeta.isMethod) {

        return false;
    }

    const funcMeta = _propMeta.functionMeta
    const paramsName = funcMeta.paramsName;
    const parameters = funcMeta.parameters;
    const defaultTypes = funcMeta.defaultParamsType;

    if (paramsName?.length === 0) {

        return true;
    }
    
    let currentArgValue;
    let currentExpectecType;
    let index = 0;

    while (
        // safe index shifting
        index + 1 < (_args?.length + 2 || defaultTypes?.length + 2) ||
        index + 1 < (paramsName?.length + 2)
    ) {
        
        const i = index++;
        const name = paramsName[i];
        const paramMeta = parameters?.[name];
        
        if (!isObject(paramMeta)) {
            /**
             * there is no parameter defined here
             */
            continue;
        }

        const type = paramMeta.type;

        if (!isAbstract(type)) {c
            /**
             * didn't have type for current param
             */
            continue;
        }

        currentExpectecType = type;
        currentArgValue = isValuable(_args[i]) ? _args[i] : paramMeta.defaultValue;

        if (
            !isValuable(currentArgValue) &&
            paramMeta.allowNull === true
        ) {
            
            continue;
        }

        if (!matchType(type, currentArgValue)) {

            const paramIndentifier = _propMeta.functionMeta.paramsName[i] || i;
            throw new ArgumentsNotMatchError({
                type: currentExpectecType, 
                value: currentArgValue, 
                paramName: paramIndentifier,
                metadata: _propMeta
            });
        }
    }

    return true;
}