const { property_metadata_t } = require("../../../reflection/metadata");
const { getMetadataFootPrintByKey } = require("../../footPrint");
const { OVERLOADED_METHOD_NAME } = require("../constant");
const { stringifySignatureOf } = require("../debug/signature.lib");

module.exports = class OverridingNonVirtualMethodError extends ReferenceError {

    /**
     * @param {property_metadata_t} derivedPropMeta
     * @param {property_metadata_t} basePropMeta 
     */
    constructor(derivedPropMeta, basePropMeta) {

        const derivedClass = derivedPropMeta.owner.typeMeta.abstract;

        const _class = basePropMeta.owner.typeMeta.abstract;
        const methodName = getMetadataFootPrintByKey(basePropMeta, OVERLOADED_METHOD_NAME) || basePropMeta.name;
        const signature = stringifySignatureOf(basePropMeta.functionMeta);
        const msg = `could not override non-virtual${basePropMeta.static ? ' static ' : ' '}method [${_class?.name || _class}].${methodName}(${signature}) for derived class [${derivedClass?.name || derivedClass}]`;

        super(msg);
    }
}