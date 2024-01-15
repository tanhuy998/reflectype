const { FUNCTION_PARAMS, REGEX_FUNCTION_DETECT,REGEX_REMOVE_DEFAULT_ARG } = require("../function/constant.js");

module.exports = {
    discoverFunctionParams
}

/**
 *
 * @this Reflection
 */
function discoverFunctionParams() {

    if (!this.metadata.isMethod) {

        return;
    }

    if (this.metadata.isDiscovered === true) {
        
        return;
    }

    const match = this._getActualFunction()
                    ?.toString()
                    ?.match(REGEX_FUNCTION_DETECT);
    
    if (!match) {

        throw new TypeError('invalid function returned by _getActualFunction');
    }

    const list = match[FUNCTION_PARAMS]
                        ?.replace(REGEX_REMOVE_DEFAULT_ARG, '')
                        ?.replace(/\s/, '')
                        ?.split(',');
    
    this.metadata.paramsName = hasNoParam(list) ? [] : list;
    this.metadata.isDiscovered = true;
}

/**
 * 
 * @param {Array<string>} _list 
 * @returns 
 */
function hasNoParam(_list) {

    return _list.length === 0 ||
            _list.length === 1 &&
            !_list[0];
}