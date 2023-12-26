const ReflectorContext = require("../reflectorContext");
const ReflectionQuerySubject = require("../query/reflectionQuerySubject");
const ReflectionPrototypeProperty = require("./reflectionPrototypeProperty");
const ReflectionPrototypeMethod = require("./reflectionPrototypeMethod");
const ReflectionPrototypeAttribute = require("./reflectionPrototypeAttribute");
const ReflectionClassAbstract = require("../abstract/reflectionClassAbstract");
const { prototype_metadata_t } = require("../../reflection/metadata");

/**
 * @typedef {import("../../reflection/metadata").prototype_metadata_t} prototype_metadata_t 
 */

/**
 *  PrototypeReflector focus on the prototype metadata of class/object
 */
module.exports = class ReflectionClassPrototype extends ReflectionClassAbstract {

    constructor(target) {

        super(target);

        //super.__dispose();
    }

    /**
     * @override
     * @returns {boolean}
     */
    _resolveAspectOfReflection() {

        const protoMeta = super.mirror()
                                .from(ReflectionQuerySubject.PROTOTYPE)
                                .retrieve();

        if (
            !this.isValidReflection || 
        this.reflectionContext === ReflectorContext.OTHER ||
            !(protoMeta instanceof prototype_metadata_t)
        ) {
            
            return undefined;
        }

        return protoMeta;
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