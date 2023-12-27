const ReflectionQuerySubject = require("../query/reflectionQuerySubject");
const ReflectionStaticProperty = require("./reflectionStaticProperty");

module.exports = class ReflectionStaticAttribute extends ReflectionStaticProperty {

    constructor(_target, _propKey) {

        super(_target, _propKey);
    }

    _resolveAspectOfReflection() {

        if (!super.meetPrerequisite) {

            return undefined;
        }

        return super.mirror()
                .select(super.name)
                .first()
                .from(ReflectionQuerySubject.STATIC)
                .where({
                    isMethod: false
                })
                .retrieve();
    }
}