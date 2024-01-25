const { preventNonInheritanceTakeEffect } = require("../../abstraction/traitAbstractClass");
const { isObjectKey } = require("../../libs/type");
const ReflectionFunctionParameter = require("../parameter/reflectionFunctionParameter");
const ReflectorContext = require("../reflectorContext");
const { getOwnerClass } = require("../trait/traitPropertyReflection");

const METHOD_NAME = 1;

module.exports = class ReflectionMethodParameterAbstract extends ReflectionFunctionParameter {

    get ownerClass() {

        return getOwnerClass.call(this);
    }

    get methodName() {

        return this.options[METHOD_NAME];
    }

    constructor(_target, _methodKey, _index) {

        if (!isObjectKey(_methodKey)) {

            throw new Error('');
        }
        
        super(_target, _index, _methodKey);

        preventNonInheritanceTakeEffect.call(this, ReflectionMethodParameterAbstract);
    }

    _meetPrerequisite() {

        return this.reflectionContext !== ReflectorContext.OTHER
    }
}