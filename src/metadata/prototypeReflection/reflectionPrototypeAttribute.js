const ReflectionQuerySubject = require("../query/reflectionQuerySubject");
const ReflectionPrototypeProperty = require("./reflectionPrototypeProperty");


class ReflectionPrototypeAttribute extends ReflectionPrototypeProperty {

    constructor(_target, _attributeKey) {

        super(...arguments);
    }

    _resolveAspectOfReflection() {

        if (!super.meetPrerequisite) {

            return undefined;
        }

        return super.mirror()
                    .select(this.name)
                    .first()
                    .from(ReflectionQuerySubject.PROTOTYPE)
                    .where({
                        isMethod: false
                    })
                    .retrieve();
    }
}

module.exports = ReflectionPrototypeAttribute;