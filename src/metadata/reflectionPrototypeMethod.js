const ReflectionPrototypeProperty = require("./reflectionPrototypeProperty");

class ReflectionPrototypeMethod extends ReflectionPrototypeProperty {

    #isValid = false;

    #isInterface;

    #defaultArgs;

    get isValid() {

        return this.#isValid;
    }

    get defaultValue() {

        return undefined;
    }

    get returnType() {

        return super.type;
    }

    get defaultArgs() {

        return this.isValid ? super.value : undefined;
    }

    get defaultArguments() {

        this.defaultValue;
    }

    constructor(_target, _methodKey) {

        super(...arguments);

        this.#init();
    }

    #init() {

        if (!super.isValid) {

            return;
        } 

        if (!super.isMethod) {

            return;
        }
        
        //this.#defaultArgs = super.value;

        this.#isValid = true;
    }

    invoke(...args) {

        if (!this.isValid) {

            throw new Error('cannot invoke method of an invalid Reflection');
        }

        const method = this.originClass.prototype[this.name];

        const _thisContext = this.isInstance ? this.target : this.originClass;

        method.call(_thisContext, ...args);   
    }
}

module.exports = ReflectionPrototypeMethod;