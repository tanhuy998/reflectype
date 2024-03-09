const { property_metadata_t } = require("../../../reflection/metadata");
const { getMetadataFootPrintByKey } = require("../../footPrint");
const { OVERLOADED_METHOD_NAME } = require("../constant");
const { stringifySignatureOf } = require("../debug/signature.lib");

module.exports = class OverridingNonExistenceBaseClassMethod extends ReferenceError {

    /**
     * 
     * @param {property_metadata_t} derivedPropMeta 
     */
    constructor(derivedPropMeta) {

        const _class = derivedPropMeta.owner.typeMeta;
        const methodName = getMetadataFootPrintByKey(derivedPropMeta, OVERLOADED_METHOD_NAME) || derivedPropMeta.name;
        const signature = stringifySignatureOf(derivedPropMeta.functionMeta);
        const msg = `No base class implementation for${derivedPropMeta.static?' static ': ' '}method [${_class?.name || _class}].${methodName}(${signature})`;

        super(msg);
    }
}