const ReflectionClassAbstract = require("../abstract/reflectionClassAbstract");
const ReflectionClassPrototype = require("../prototypeReflection/reflectionClassPrototype");
const ReflectionQuerySubject = require("../query/reflectionQuerySubject");
const ReflectorContext = require("../reflectorContext");

/**
 * @typedef {import('../prototypeReflection/reflectionClassPrototype.js')} ReflectionClassPrototype
 */

module.exports = class ReflectionClass extends ReflectionClassAbstract {

    /**@type {ReflectionClassPrototype?} */
    get prototype() {

        if (!this.isValid) {

            return undefined;
        }

        return new ReflectionClassPrototype(this.originClass);
    }

    constructor(_target) {

        super(_target);

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
                .from(ReflectionQuerySubject.STATIC)
                .retrieve();
    }

    #init() {

        if (!super.isValid) {

            super.__dispose();
            return;
        }
    }

    _getPropertyReflectionClass() {

        return require('./reflectionStaticProperty.js');
    }

    _getMethodReflectionClass() {

        return require('./reflectionStaticMethod.js');
    }

    _getAttributeReflectionClass() {

        return require('./reflectionStaticAttribute.js');
    }
}

function not(expr) {

    return !expr;
}