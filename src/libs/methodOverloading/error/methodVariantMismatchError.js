const { property_metadata_t, function_metadata_t } = require("../../../reflection/metadata");
const { Any } = require("../../../type");
const { getTypeOf } = require("../../type");

module.exports = class MethodVariantMismatchError extends ReferenceError {
    /**
     * 
     * @param {function_metadata_t} genericFuncMeta 
     * @param {Array} args 
     */
    constructor(genericFuncMeta, args = []) {
        
        const _class = genericFuncMeta.owner.owner.typeMeta.abstract;
        args = Array.prototype.map.call(args, (val =>( getTypeOf(val) || Any).name)).join(', ');

        super(`There are no inmplementation for [${_class?.name || _class}].${genericFuncMeta.name}(${args})`);
    }
}