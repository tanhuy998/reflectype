const { isObjectKey } = require("../../libs/type");
const { metaOf, property_metadata_t } = require("../../reflection/metadata");
const ReflectionMethodParameterAbstract = require("../abstract/reflectionMethodParameterAbstract");
const ReflectorContext = require("../reflectorContext");

module.exports = class ReflectionMethodParameter extends ReflectionMethodParameterAbstract {

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

        return  super.mirror()
                            .select(methodName)
                            .on('properties')
                            .where({
                                isMethod: true
                            })
                            .retrieve()
                        || metaOf(super.originClass[methodName]);
    }
} 