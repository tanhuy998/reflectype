const { getCastedTypeOf } = require("../casting.lib")
const { getTypeOf } = require("../type")
const { getVPtrOf } = require("../typeEnforcement.lib")
const { NULLABLE } = require("./constant")

module.exports = {
    getTypeForFunctionDispatch
}

/**
 * 
 * @param {any} val 
 * @returns {Function|Symbol}
 */
function getTypeForFunctionDispatch(val) {

    return getCastedTypeOf(val) || getTypeOf(val) || NULLABLE
}