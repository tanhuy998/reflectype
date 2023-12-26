const { isInstantiable } = require("../libs/type");
const self = require("../utils/self")

/**
 * @param {Function} _BaseClass
 * 
 * @this {Object}
 */
function preventNonInheritanceTakeEffect(_BaseClass) {

    if (!isInstantiable(_BaseClass)) {

        throw new TypeError('_BaseClass must be instantiable');
    }

    if (
        self(this) === _BaseClass || 
        !(this instanceof _BaseClass)
    ) {

        throw new Error(`[${_BaseClass.name}] is abstract class, it must be inherited for instantiation`);
    }
}



module.exports = {preventNonInheritanceTakeEffect}