const { preventNonInheritanceTakeEffect } = require("../../abstraction/traitAbstractClass");
const { isObjectKey } = require("../../libs/type");
const { metaOf } = require("../../reflection/metadata");
const ReflectorContext = require("../reflectorContext");
const ReflectionParameterAbstract = require("./reflectionParameterAbstract");

module.exports = class ReflectionMethodParameterAbstract extends ReflectionParameterAbstract {

    constructor(_target, _methodKey, _index) {

        if (!isObjectKey(_methodKey)) {

            throw new Error('');
        }

        super(_target, _index, _methodKey);

        preventNonInheritanceTakeEffect.call(this, ReflectionMethodParameterAbstract);
        
        //this.#init();
    }

    /**
     * @override
     * 
     * @returns {property_metadata_t?}
     */
    _resovleFunctionMetadata() {

        if (
            super.reflectionContext === ReflectorContext.OTHER
        ) {

            return undefined;
        }

        return this._childFunctionMeta();
    }

    _childFunctionMeta() {
        /**
         * for derived class overriden
         */
    }
}