const { preventNonInheritanceTakeEffect } = require("../../abstraction/traitAbstractClass");
const ReflectionFunction = require("../function/reflectionFunction");
const ReflectorContext = require("../reflectorContext");
const { reflectParameters } = require("../trait/traitfunctionReflection");
const AbstractReflection = require("./abstractReflection");

const METHOD_NAME = 0;

module.exports = class ReflectionMethodAbstract extends ReflectionFunction {

    get methodName() {

        return super.options[METHOD_NAME]
    }

    constructor(_target, _methodKey) {

        super(_target, _methodKey);

        preventNonInheritanceTakeEffect.call(this, ReflectionMethodAbstract);
    }

    _meetPrerequisite() {

        return super.isValidReflection && 
                super.reflectionContext !== ReflectorContext.OTHER;
    }
}