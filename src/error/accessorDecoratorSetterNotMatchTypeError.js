const { reproduceReadableClassAttributeIndentifier } = require("../utils/stringGenerator.js");
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
    constructor(value, propMeta) {

        const expectPropValueType = propMeta.type;
        const settedType = value.constructor?.name ?? value;
        const attributeName = reproduceReadableClassAttributeIndentifier(propMeta);

        super(`could not set value of type [${settedType}] to ${attributeName} that expects type of [${expectPropValueType.name}].`);
    }
}