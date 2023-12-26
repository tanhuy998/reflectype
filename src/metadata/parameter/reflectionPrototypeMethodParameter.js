const { isObjectKey } = require("../../libs/type");
const { property_metadata_t, metaOf } = require("../../reflection/metadata");
const ReflectionMethodParameterAbstract = require("../abstract/reflectionMethodParameterAbstract");
const ReflectionQuerySubject = require("../query/reflectionQuerySubject");

module.exports = class ReflectionPrototypeMethodParameter extends ReflectionMethodParameterAbstract {

    constructor(_target, _methodKey, _index) {

        super(_target, _methodKey, _index);
    }

    /**
     * @override
     * 
     * @returns {property_metadata_t?}
     */
    _childFunctionMeta() {
        
        const methodName = super.methodName;
        
        if (!isObjectKey(methodName)) {

            return undefined;
        }
        
        return super.mirror()
                            .select(methodName)
                            .on('properties')
                            .from(ReflectionQuerySubject.PROTOTYPE)
                            .where({
                                isMethod: true
                            })
                            .retrieve()
                        || metaOf(super.originClass.prototype[methodName]);
    }
}