const ReflectionPropertyAbstract = require("../abstract/reflectionPropertyAbstract");
const ReflectionQuerySubject = require("../query/reflectionQuerySubject");
const ReflectorContext = require("../reflectorContext");

module.exports = class ReflectionStaticProperty extends ReflectionPropertyAbstract {

    constructor(_target, _propKey) {

        super(_target, _propKey);

        this.#init();
    }

    /**
     * @override
     * @returns 
     */
    _meetPrerequisite() {

        return super.isValidReflection &&
                super._meetPrerequisite() &&
                super.reflectionContext !== ReflectorContext.PROTOTYPE;
    }

    /**
     * @override
     * @returns 
     */
    _resolveAspectOfReflection() {

        if (!super.meetPrerequisite) {

            return undefined;
        }

        const propName = super.name;

        return super.mirror()
                    .select(propName)
                    .from(ReflectionQuerySubject.STATIC);
    }

    #init() {

        if (!super.isValid) {

            super.__dispose();
            return;
        }
    }
}