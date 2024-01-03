const ReflectionQuerySubject = require("../query/reflectionQuerySubject");
const ReflectionPrototypeProperty = require("./reflectionPrototypeProperty");
const ReflectionPrototypeMethod = require("./reflectionPrototypeMethod");
const ReflectionPrototypeAttribute = require("./reflectionPrototypeAttribute");
const ReflectionClassAbstract = require("../abstract/reflectionClassAbstract");
const { prototype_metadata_t } = require("../../reflection/metadata");

/**
 * @typedef {import("../../reflection/metadata").prototype_metadata_t} prototype_metadata_t 
 */


module.exports = class ReflectionClassPrototype extends ReflectionClassAbstract {

    constructor(target) {

        super(target);
    }

    /**
     * @override
     * @returns {boolean}
     */
    _resolveAspectOfReflection() {
        
        if (!super.meetPrerequisite) {

            return undefined;
        }
        
        return super.mirror()
                .from(ReflectionQuerySubject.PROTOTYPE)
                .retrieve();
    }

     /**
     * @override
     * @returns {boolean}
     */
    _getPropertyReflectionClass() {

        return ReflectionPrototypeProperty;
    }

    /**
     * @override
     * @returns {boolean}
     */
    _getMethodReflectionClass() {

        return ReflectionPrototypeMethod;
    }

    /**
     * @override
     * @returns {boolean}
     */
    _getAttributeReflectionClass() {

        return ReflectionPrototypeAttribute;
    }
}