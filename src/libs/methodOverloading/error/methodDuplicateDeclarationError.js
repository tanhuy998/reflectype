const { property_metadata_t } = require("../../../reflection/metadata");
const { getMetadataFootPrintByKey } = require("../../footPrint");
const { OVERLOADED_METHOD_NAME } = require("../constant");
const { stringifySignatureOf } = require("../debug/signature.lib");

module.exports = class MethodDuplicateDeclarationError extends Error {

    /**
     * 
     * @param {property_metadata_t} propMeta 
     */
    constructor(propMeta) {

        const _class = propMeta.owner.typeMeta.abstract;
        const overloadedName = getMetadataFootPrintByKey(propMeta, OVERLOADED_METHOD_NAME);
        const signature = stringifySignatureOf(propMeta.functionMeta);
        const msg = `duplicate declaration of${propMeta.static ? ' static ' : ' '}method [${_class?.name || _class}].${overloadedName}(${signature})`;

        super(msg);
    }
}