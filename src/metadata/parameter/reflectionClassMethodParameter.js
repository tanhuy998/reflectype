const { isObjectKey } = require("../../libs/type");
const { metaOf, property_metadata_t } = require("../../reflection/metadata");
const ReflectionMethodParameterAbstract = require("../abstract/reflectionMethodParameterAbstract");
const ReflectionQuerySubject = require("../query/reflectionQuerySubject");
const ReflectorContext = require("../reflectorContext");

module.exports = class ReflectionClassMethodParameter extends ReflectionMethodParameterAbstract {

    constructor(_target, _methodKey, _index) {
        
        super(_target, _methodKey, _index);
    }

    _resolveAspectOfReflection() {

        const methodName = super.methodName;

        if (!isObjectKey(methodName)) {
            
            return undefined;
        }

        return  super.mirror()
                            .select(methodName)
                            .on('properties')
                            .from(ReflectionQuerySubject.STATIC)
                            .where({
                                isMethod: true
                            })
                            .first()
                            .retrieve()
                        || metaOf(super.originClass[methodName]);
    }
} 