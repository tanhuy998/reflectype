const ReflectionMethodAbstract = require("../abstract/reflectionMethodAbstract.js");
const ReflectionQuerySubject = require('../query/reflectionQuerySubject.js');

/**
 * @typedef {import('../../../src/reflection/metadata.js').property_metadata_t} property_metadata_t
 */

class ReflectionPrototypeMethod extends ReflectionMethodAbstract {

    constructor(_target, _methodKey) {

        super(_target, _methodKey);

        this.#init();
    }

    _resolveAspectOfReflection() {
        
        if (!super.meetPrerequisite) {

            return undefined;
        }
        
        return super.mirror()
                .select(super.methodName)
                .from(ReflectionQuerySubject.PROTOTYPE)
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