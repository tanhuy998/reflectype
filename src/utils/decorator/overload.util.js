const { OVERLOAD_TARGET, OVERLOAD_APPLIED, OVERLOAD_PENDING } = require('../../libs/methodOverloading/constant');
const {IS_FINAL} = require('../../libs/keyword/constant')
const { getMetadataFootPrintByKey, setMetadataFootPrint } = require('../../libs/footPrint');
const { retrieveTypeMetadata } = require('../../libs/metadata/metadataTrace');
const propertyDecorator = require('../../libs/propertyDecorator');
const MetadataAspect = require('../../metadata/aspect/metadataAspect');
const ReflectionQuerySubject = require('../../metadata/query/reflectionQuerySubject');
const { property_metadata_t, metadata_t } = require('../../reflection/metadata');
const final = require('../../decorators/final');

module.exports = {
    setFootPrint,
    manipulateOverloading,
    ensureOverloadingTakesRightPlace,
    ensureTargetOfOverloadingExists,
    ensureTargetOfOverloadingExistsOnTypeMeta,
}

/**
 * 
 * @param {property_metadata_t} propMeta 
 * @param {property_metadata_t} targetPropMeta
 */
function setFootPrint(_, decoratorContext, propMeta, targetPropMeta) {

    const funcMeta = propMeta.functionMeta;

    final(_, decoratorContext); // decorator that mark the current method is final
    setMetadataFootPrint(funcMeta, OVERLOAD_TARGET, targetPropMeta);
    setMetadataFootPrint(funcMeta, OVERLOAD_PENDING);
    setMetadataFootPrint(propMeta, OVERLOAD_APPLIED);
}

function ensureOverloadingTakesRightPlace(_, context, nameOfMethodToOverload) {

    const { kind, metadata, name } = context;
    const isStatic = context.static;

    if (kind !== 'method') {

        throw new Error();
    }
}

/**
 * 
 * @param {metadata_t} typeMeta 
 */
function ensureTargetOfOverloadingExists(_, context, nameOfMethodToOverload) {

    const isStatic = context.static;
    const typeMeta = retrieveTypeMetadata(_, context);

    if (!typeMeta) {

        throw new ReferenceError('');
    }

    return ensureTargetOfOverloadingExistsOnTypeMeta(typeMeta, nameOfMethodToOverload, context)
}

function ensureTargetOfOverloadingExistsOnTypeMeta(typeMeta, nameOfMethodToOverload, context) {

    /**@type {property_metadata_t} */
    const targetPropMeta = new MetadataAspect(typeMeta)
        .query()
        .select(nameOfMethodToOverload)
        .from(context.static ? ReflectionQuerySubject.STATIC : ReflectionQuerySubject.PROTOTYPE)
        .where({
            isMethod: true,
            static: context.static,
            private: context.private,
        })
        .retrieve();

    if (
        !targetPropMeta ||
        targetPropMeta.owner.typeMeta !== typeMeta
    ) {

        throw new ReferenceError();
    }

    

    if (
        getMetadataFootPrintByKey(targetPropMeta.functionMeta, IS_FINAL) === true
    ) {

        throw new Error('could not declare a final method as overloading method of another');
    }

    return targetPropMeta;
}

function manipulateOverloading(_, decoratorContext, nameOfMethodToOverload) {

    ensureOverloadingTakesRightPlace(_, decoratorContext, nameOfMethodToOverload);
    const targetPropMeta = ensureTargetOfOverloadingExists(_, decoratorContext, nameOfMethodToOverload);
    const propMeta = propertyDecorator.initMetadata(_, decoratorContext);


    setFootPrint(_, decoratorContext, propMeta, targetPropMeta);

    return propMeta;
}