const { OVERLOAD_TARGET, OVERLOAD_APPLIED, OVERLOAD_PENDING, OVERLOADED_METHOD_NAME } = require('../../libs/methodOverloading/constant');
const {IS_FINAL} = require('../../libs/keyword/constant')
const { getMetadataFootPrintByKey, setMetadataFootPrint } = require('../../libs/footPrint');
const { retrieveTypeMetadata } = require('../../libs/metadata/metadataTrace');
const MetadataAspect = require('../../metadata/aspect/metadataAspect');
const ReflectionQuerySubject = require('../../metadata/query/reflectionQuerySubject');
const { property_metadata_t, metadata_t } = require('../../reflection/metadata');
//const final = require('../../decorators/final');
const { METADATA } = require('../../constants');

module.exports = {
    setOverloadFootPrint,
    setupOverload,
    //manipulateOverloading,
    ensureOverloadingTakesRightPlace,
    ensureTargetOfOverloadingExists: ensureTargetOfOverloadingExistsAndReturn,
    ensureTargetOfOverloadingExistsAndReturn,
    ensureTargetOfOverloadingExistsOnTypeMeta,
    validateAndReturnTargetPropMeta,
}

/**
 * 
 * @param {property_metadata_t} propMeta 
 * @param {property_metadata_t} targetPropMeta
 */
function setupOverload(_, decoratorContext, propMeta, targetPropMeta) {

    //final(_, decoratorContext); // decorator that mark the current method is final
    setOverloadFootPrint(propMeta, targetPropMeta)
}

function setOverloadFootPrint(propMeta, targetPropMeta) {

    const funcMeta = propMeta.functionMeta;

    setMetadataFootPrint(funcMeta, OVERLOAD_TARGET, targetPropMeta);
    setMetadataFootPrint(funcMeta, OVERLOAD_PENDING);
    setMetadataFootPrint(propMeta, OVERLOAD_APPLIED);
    setMetadataFootPrint(propMeta, OVERLOADED_METHOD_NAME, targetPropMeta.name);
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
function ensureTargetOfOverloadingExistsAndReturn(_, context, nameOfMethodToOverload) {

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

function validateAndReturnTargetPropMeta(_, decoratorContext, nameOfMethodToOverload) {

    ensureOverloadingTakesRightPlace(_, decoratorContext, nameOfMethodToOverload);
    return ensureTargetOfOverloadingExistsAndReturn(_, decoratorContext, nameOfMethodToOverload);
}

// function manipulateOverloading(_, decoratorContext, nameOfMethodToOverload) {

//     const targetPropMeta = validateAndReturnTargetPropMeta(_, decoratorContext, nameOfMethodToOverload);
//     const propertyDecorator = require('../../libs/propertyDecorator');
//     const propMeta = propertyDecorator.initMetadata(_, decoratorContext);

//     setupOverload(_, decoratorContext, propMeta, targetPropMeta);

//     return propMeta;
// }