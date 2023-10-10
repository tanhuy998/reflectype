const ReflectionFunction = require("./reflectionFunction");
const ReflectionPrototypeProperty = require("./reflectionPrototypeProperty");

class ReflectionPrototypeMethod extends ReflectionPrototypeProperty {

    #isValid = false;

    #isMethod;

    #returnType;
    #defaultArgs;
    #argsType;
    #allowNull;

    #isInterface;

    get isValid() {

        return this.#isValid;
    }

    get isMethod() {

        return this.#isMethod;
    }

    get defaultValue() {

        return undefined;
    }

    get isValid() {

        return this.#isValid;
    }

    get returnType() {

        return this.#returnType;
    }

    get defaultArguments() {

        return this.#defaultArgs;
    }

    get parameters() {


    }

    constructor(_target, _methodKey) {

        super(...arguments);

        this.#init();
    }

    #init() {

        if (!super.isValid) {

            this.#readOnActualMethod();
        } 

        if (!super.isMethod) {

            return;
        }
        
        //this.#defaultArgs = super.value;

        this.#isValid = true;
    }

    #readOnActualMethod() {

        const methodName = this.name;

        const actualMethod = this.originClass.prototype[methodName];

        if (typeof actualMethod !== 'function') {

            this.#isMethod = false;
            this.#isValid = false;
            return;
        }

        const reflection = new ReflectionFunction(actualMethod);

        if (!reflection.isValid) {

            this.#isMethod = false;
            this.#isValid = false;
            return;
        }

        this.#isMethod = true;
        this.#isValid = true;

        this.#defaultArgs = reflection.defaultArguments;
        this.#allowNull = reflection.allowReturnNull;
        this.#returnType = reflection.returnType;
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