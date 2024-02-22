const { CASTED_TYPE } = require("./constant");
const { isPrimitive, isValuable, matchType } = require("./type");

module.exports = {
    getCastedTypeOf,
    releaseTypeCast,
    static_cast,
    dynamic_cast,
    const_cast,
}


function getCastedTypeOf(object) {
    //console.time(2)

    const f = object?.[CASTED_TYPE];
    let ret = typeof f === 'function' ? f() : undefined;

    //console.timeEnd(2)
    return ret;
    // try {

        
    // }
    // catch {
    //     //console.timeEnd(2)
    //     return undefined;
    // }
}

function releaseTypeCast(object) {

    if (
        !meetPrerequisites(object)
    ) {

        return;
    }

    object[CASTED_TYPE] = undefined;
}

/**
 * 
 * @param {Function} _t 
 * @param {Object|any} target 
 * @returns {Object|any}
 */
function static_cast(_t, target) {

    if (
        !meetPrerequisites(target)
    ) {

        return target;
    }

    if (!matchType(_t, target)) {

        throw new TypeError();
    }

    let cast_t = _t;
    let pre = Date.now();

    target[CASTED_TYPE] = () => {

        const ret = Date.now() === pre ? cast_t : undefined;
        cast_t = undefined;
        pre = undefined;

        return ret;
    };

    return target;
}

/**
 * 
 * @param {Object|any} target 
 * @returns {Object|any}
 */
function dynamic_cast(target) {

    releaseTypeCast(target);

    return target;
}

function const_cast() {


}

function meetPrerequisites(target) {

    return !isPrimitive(target) && isValuable(target)
}