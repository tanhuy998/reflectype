const {reflectParameters} = require('../trait/traitfunctionReflection.js');
const { metaOf } = require("../../reflection/metadata.js");
const ReflectionPrototypeMethodParameter = require("../parameter/reflectionPrototypeMethodParameter.js");
const ReflectionMethodAbstract = require("../abstract/reflectionMethodAbstract.js");

/**
 * @typedef {import('../../../src/reflection/metadata.js').property_metadata_t} property_metadata_t
 */

class ReflectionPrototypeMethod extends ReflectionMethodAbstract {

    constructor(_target, _methodKey) {

        super(_target, _methodKey);

        this.#init();
    }

    _meetPrerequisite() {

        return super.isValidReflection &&
                super._meetPrerequisite() &&
                super.reflectionContext !== ReflectorContext.PROTOTYPE;
    }

    _resolveAspectOfReflection() {

        if (!super.meetPrerequisite) {

            return undefined;
        }
        
        return super.mirror()
                .select(super.methodName)
                .from(ReflectionQuerySubject.STATIC)
                .where({
                    isMethod: true
                })
                .first()
                .on('properties')
                .retrieve()
                || super.resolveAspectOnActualMethod();
    }

    _getReflectionParameterClass() {

        return require('../parameter/reflectionPrototypeMethodParameter.js');
    }

    #init() {

        
    }
}

module.exports = ReflectionPrototypeMethod;