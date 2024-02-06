const { getMetadataFootPrintByKey } = require("../../libs/footPrint");
const { LEGACY_PROP_META } = require("../../libs/metadata/constant");
const { retrieveOverloadedNameIfPseudoMethodExists } = require("../../libs/methodOverloading/pseudoMethod.lib");
const { isObjectKey } = require("../../libs/type");
const { property_metadata_t } = require("../../reflection/metadata");
const { ensureTargetOfOverloadingExists, setFootPrint, ensureTargetOfOverloadingExistsOnTypeMeta } = require("./overload.util");

module.exports = {
    postDecoratorInit
}

/**
 * @param {any}
 * @param {Object} decoratorContext
 * @param {property_metadata_t} propMeta 
 */
function postDecoratorInit(_, decoratorContext, propMeta) {
    
    const targetOfPseudoOverloadingName = retrieveOverloadedNameIfPseudoMethodExists(_, decoratorContext) 
                                            || retrieveNameIfHasLegacyPropMeta(propMeta);
    const legacyPropMeta = getMetadataFootPrintByKey(propMeta, LEGACY_PROP_META)
    const isNonPseudoDerivedClassOverload = legacyPropMeta instanceof property_metadata_t;

    if (
        !isObjectKey(targetOfPseudoOverloadingName)
    ) {

        return;
    }

    const targetOfOverloadingPropMeta = isNonPseudoDerivedClassOverload ? 
                                        ensureTargetOfOverloadingExistsOnTypeMeta(
                                            legacyPropMeta.owner.typeMeta, 
                                            targetOfPseudoOverloadingName, 
                                            decoratorContext
                                        ) : ensureTargetOfOverloadingExists(
                                            _, 
                                            decoratorContext, 
                                            targetOfPseudoOverloadingName
                                        );
    setFootPrint(_, decoratorContext, propMeta, targetOfOverloadingPropMeta);
}

/**
 * 
 * @param {property_metadata_t} propMeta 
 */
function retrieveNameIfHasLegacyPropMeta(propMeta) {

    return getMetadataFootPrintByKey(propMeta, LEGACY_PROP_META)?.name;
}