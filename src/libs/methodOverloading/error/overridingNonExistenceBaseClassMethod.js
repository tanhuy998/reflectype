const { property_metadata_t } = require("../../../reflection/metadata");
const { getMetadataFootPrintByKey } = require("../../footPrint");
const { OVERLOADED_METHOD_NAME } = require("../constant");
const { stringifySignatureOf, stringifyFullyQualifiedFuncName } = require("../debug/signature.lib");

module.exports = class OverridingNonExistenceBaseClassMethod extends ReferenceError {

    /**
     * 
     * @param {property_metadata_t} derivedPropMeta 
     */
    constructor(derivedPropMeta) {

        super(`No base class implementation for ${stringifyFullyQualifiedFuncName(derivedPropMeta.functionMeta)}`);
    }
}