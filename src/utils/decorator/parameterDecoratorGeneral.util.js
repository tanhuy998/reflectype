const { retrieveOverloadedNameIfPseudoMethodExists } = require("../../libs/methodOverloading/pseudoMethod.lib");
const { isObjectKey } = require("../../libs/type");
const { property_metadata_t } = require("../../reflection/metadata");
const { ensureTargetOfOverloadingExists, setFootPrint } = require("./overload.util");

module.exports = {
    postDecoratorInit
}

/**
 * @param {any}
 * @param {Object} decoratorContext
 * @param {property_metadata_t} propMeta 
 */
function postDecoratorInit(_, decoratorContext, propMeta) {
    
    const targetOfPseudoOverloadingName = retrieveOverloadedNameIfPseudoMethodExists(_, decoratorContext);

    if (
        !isObjectKey(targetOfPseudoOverloadingName)
    ) {

        return;
    }

    const targetOfOverloadingPropMeta = ensureTargetOfOverloadingExists(_, decoratorContext, targetOfPseudoOverloadingName);
    setFootPrint(_, decoratorContext, propMeta, targetOfOverloadingPropMeta);
}