const matchType = require('./matchType.js');
const ArgumentsNotMatchError = require('../error/argumentsNotMatchError.js');

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
    const defaultTypes = _propMeta.defaultParamsType;

    let error = false;

    if (!defaultTypes || !defaultArgs) {

        return true;
    }

    // if (defaultArgs.length < defaultTypes.length) {

    //     error = true;
    // }
    
    let currentArgValue;
    let currentExpectecType;

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
        }
    }
    
    if (error) {

        if (!_args) {

            throw new TypeError('default arguments not match the default parameters\'s type');
        }
        else {
            
            throw new ArgumentsNotMatchError(currentExpectecType, currentArgValue);
        }
    }

    return true;
}


module.exports = {compareArgsWithType};