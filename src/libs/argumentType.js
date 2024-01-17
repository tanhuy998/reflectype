const ArgumentsNotMatchError = require('../error/argumentsNotMatchError.js');
const { matchType } = require('./type.js');

/**
 * @typedef {import('../reflection/metadata.js').property_metadata_t} property_metadata_t
 * @typedef {impot('../reflection/metadata.js').function_metadata_t} function_metadata_t
 */

module.exports = {
    compareArgsWithType
};

/**
 * 
 * @param {property_metadata_t} _propMeta 
 */
function compareArgsWithType(_propMeta, _args) {

    if (!_propMeta.isMethod) {

        return false;
    }

    /**@type {Array} */
    const defaultArgs = _args ?? _propMeta.value;  
    const defaultTypes = _propMeta.functionMeta.defaultParamsType;

    let error = false;

    if (!defaultTypes || !defaultArgs) {

        return true;
    }

    // if (defaultArgs.length < defaultTypes.length) {

    //     error = true;
    // }
    
    let currentArgValue;
    let currentExpectecType;
    let paramIndex = 0;

    if (!error) {

        const arg = defaultArgs[Symbol.iterator]();

        for (const type of defaultTypes) {

            currentExpectecType = type;
            currentArgValue = arg.next().value;

            if (currentArgValue === undefined || currentArgValue === null) {
                
                continue;
            }

            if (!matchType(type, currentArgValue)) {

                error = true;

                break;
            }

            ++paramIndex;
        }
    }
    
    if (error) {

        if (!_args) {

            throw new TypeError('default arguments not match the default parameters\'s type');
        }
        else {
            
            const paramIndentifier = _propMeta.functionMeta.paramsName[paramIndex] || paramIndex;
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