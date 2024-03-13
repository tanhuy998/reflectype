const { function_metadata_t } = require("../../../reflection/metadata");
const { stringifyFullyQualifiedFuncName } = require("../debug/signature.lib");

module.exports = class AmbigousSignatureConflictError extends ReferenceError {

    /**
     * 
     * @param {function_metadata_t} overloadingFuncMeta 
     * @param {function_metadata_t} existedFuncMeta 
     */
    constructor(overloadingFuncMeta, existedFuncMeta) {

        const second = stringifyFullyQualifiedFuncName(overloadingFuncMeta);
        const first = stringifyFullyQualifiedFuncName(existedFuncMeta);

        super(`ambigous between declaration ${first} and ${second}`);
    }
}