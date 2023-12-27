const ReflectionMethodAbstract = require("../abstract/reflectionMethodAbstract");
const ReflectionQuerySubject = require("../query/reflectionQuerySubject");
const ReflectorContext = require("../reflectorContext");

module.exports = class ReflectionStaticMethod extends ReflectionMethodAbstract {

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

        return require('../parameter/reflectionClassMethodParameter');
    }

    #init() {

        console.log(this.metadata)
    }
}