const { OVERLOAD_TARGET, OVERLOAD_APPLIED, OVERLOAD_PENDING } = require('../libs/methodOverloading/constant');
const {IS_FINAL} = require('../libs/keyword/constant')
const {DECORATED_VALUE} = require('../libs/constant');
const { getMetadataFootPrintByKey, metadataHasFootPrint, setMetadataFootPrint, retrieveDecoratorFootPrintByKey } = require('../libs/footPrint');
const { retrieveTypeMetadata } = require('../libs/metadata/metadataTrace');
const { initOverloadedPropeMeta } = require('../libs/methodVariant');
const propertyDecorator = require('../libs/propertyDecorator');
const { isNonIterableObjectKey } = require('../libs/type');
const MetadataAspect = require('../metadata/aspect/metadataAspect');
const ReflectionQueryBuilder = require('../metadata/query/reflectionQueryBuilder');
const ReflectionQuerySubject = require('../metadata/query/reflectionQuerySubject');
const { property_metadata_t, function_metadata_t } = require('../reflection/metadata');
const final = require('./final');

module.exports = overload;

function overload(nameOfMethodToOverload) {

    if (!isNonIterableObjectKey(nameOfMethodToOverload)) {

        throw new TypeError();
    }

    return function(_, context) {

        const {kind, metadata, name} = context;
        const isStatic = context.static;

        if (kind !== 'method') {

            throw new Error();
        }
        
        const typeMeta = retrieveTypeMetadata(...arguments);

        if (!typeMeta) {

            throw new ReferenceError();
        }

        /**@type {property_metadata_t} */
        const targetPropMeta = new MetadataAspect(typeMeta)
                            .query()
                            .select(nameOfMethodToOverload)
                            .from(isStatic ? ReflectionQuerySubject.STATIC : ReflectionQuerySubject.PROTOTYPE)
                            .where({
                                isMethod: true,
                                static: isStatic,
                                private: context.private,
                            })
                            .retrieve();

        if (
            !targetPropMeta
        ) {

            throw new ReferenceError();
        }

        if (retrieveDecoratorFootPrintByKey(_, context, OVERLOAD_APPLIED)) {

            throw new Error('apply @overload on a method multiple times is not allowed');
        }

        if (
            getMetadataFootPrintByKey(targetPropMeta.functionMeta, IS_FINAL) === true
        ) {

            throw new Error('could not declare a final method as overloading method of another');
        }



        const propMeta = propertyDecorator.initMetadata(...arguments);
        //registerOverloadParams(propMeta, targetPropMeta);
        const funcMeta = propMeta.functionMeta;

        final(_, context); // decorator that mark the current method is final
        setMetadataFootPrint(funcMeta, OVERLOAD_TARGET, propMeta);
        setMetadataFootPrint(funcMeta, OVERLOAD_PENDING);
        setMetadataFootPrint(propMeta, OVERLOAD_APPLIED);

        return getMetadataFootPrintByKey(propMeta, DECORATED_VALUE);
    }
}

/**
 * 
 * @param {function_metadata_t} funcMeta 
 */
function detectParams(funcMeta) {

    
}

// /**
//  * 
//  * @param {property_metadata_t} overloadPropMeta 
//  * @param {property_metadata_t} targetPropMeta 
//  */
// function registerOverloadParams(overloadPropMeta, targetPropMeta) {

//     initOverloadedPropeMeta(targetPropMeta);
// }
