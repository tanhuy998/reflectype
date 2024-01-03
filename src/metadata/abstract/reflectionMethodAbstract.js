const { preventNonInheritanceTakeEffect } = require("../../abstraction/traitAbstractClass");
const ReflectionFunction = require("../function/reflectionFunction");
const ReflectorContext = require("../reflectorContext");

const METHOD_NAME = 0;

module.exports = class ReflectionMethodAbstract extends ReflectionFunction {

    get methodName() {

        return super.options[METHOD_NAME]
    }

    get isStatic() {

        return this.metadata?.static;
    }

    get isPrivate() {

        return this.metadata?.private;
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