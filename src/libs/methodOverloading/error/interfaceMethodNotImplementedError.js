const { metadata_t, property_metadata_t } = require("../../../reflection/metadata");
const { stringifyFullyQualifiedFuncName } = require("../debug/signature.lib");

module.exports = class InterfaceMethodNotImplementedError extends ReferenceError {

    /**
     * 
     * @param {metadata_t} hostTypeMeta 
     * @param {property_metadata_t} interfacePropMeta 
     */
    constructor(hostTypeMeta, interfacePropMeta) {
        
        const intfName = interfacePropMeta.owner.typeMeta.abstract.name;
        const hostClassName = hostTypeMeta.abstract.name;

        super(`class [${hostClassName}] implements [${intfName}] but there is no implemetantion for ${stringifyFullyQualifiedFuncName(interfacePropMeta.functionMeta)}`);
    }
}