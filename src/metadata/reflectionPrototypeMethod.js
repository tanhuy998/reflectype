const ReflectionPrototypeProperty = require("./reflectionPrototypeProperty");

class ReflectionPrototypeMethod extends ReflectionPrototypeProperty {

    static {

        
    }

    #isValid = false;

    #isInterface

    get isValid() {

        return this.#isValid;
    }

    get defaultValue() {

        return undefined;
    }

    get returnType() {

        return super.type;
    }

    constructor(_target, _methodKey) {

        super(...arguments);

        this.#init();
    }

    #init() {

        if (!super.isValid) {

            return;
        }

        if (typeof super.value !== 'function') {

            return;
        }

        this.#isValid = true;
    }

    invoke(...args) {

        if (!this.isValid) {

            throw new Error('cannot invoke method of an invalid Reflection');
        }

        const method = this.value;

        const _thisContext = this.isInstance ? this.target : this.originClass;

        method.call(_thisContext, ...args);   
    }
}

module.exports = ReflectionPrototypeMethod;