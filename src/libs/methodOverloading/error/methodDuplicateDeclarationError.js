const { property_metadata_t } = require("../../../reflection/metadata");
const { getMetadataFootPrintByKey } = require("../../footPrint");
const { OVERLOADED_METHOD_NAME } = require("../constant");
const { stringifySignatureOf, stringifyFullyQualifiedFuncName } = require("../debug/signature.lib");

module.exports = class MethodDuplicateDeclarationError extends Error {

    /**
     * 
     * @param {property_metadata_t} propMeta 
     */
    constructor(propMeta) {

        super(`Duplicate declaration of ${stringifyFullyQualifiedFuncName(propMeta.functionMeta)}`);
    }
}