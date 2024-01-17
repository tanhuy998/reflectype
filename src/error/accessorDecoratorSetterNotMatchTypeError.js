const { reproduceReadableClassAttributeIndentifier } = require("../utils/string.util.js");
const AccessorDecoratorError = require("./accessorDecoratorError");

/**
 * @typedef {import('../reflection/metadata.js').property_metadata_t} property_metadata_t
 */

module.exports = class AccesorDecoratorSetterNotMatchTypeError extends AccessorDecoratorError {

    /**
     * 
     * @param {*} value 
     * @param {property_metadata_t} propMeta 
     */
    constructor({value, metadata}) {

        const expectPropValueType = metadata.type;
        const settedType = value.constructor?.name ?? value;
        const attributeName = reproduceReadableClassAttributeIndentifier(metadata);

        super(`could not set value of type [${settedType}] to ${attributeName} that expects type of [${expectPropValueType.name}].`);
    }
}