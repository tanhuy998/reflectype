const Reflection = require("../reflection");
const ReflectorContext = require("../reflectorContext");

module.exports = class ReflectionClassAbstract extends Reflection {

    #es6 = false;

    #isValid;

    get isValidReflection() {

        return this.#isValid;
    }

    get isES6Class() {

        return this.#es6;
    }

    constructor(_any) {

        super(_any);

        this.#init();
    }

    #init() {

        if (
            !super.isValidReflection || 
        super.reflectionContext === ReflectorContext.OTHER
        ) {

            this.#isValid = false;
            return;
        }

        this.#isValid = true;
        this.#checkES6();
    }

    #checkES6() {

        this.#es6 = this.originClass?.toString()
                    .match(/^class \w+ {/) ? true : false;
    }
}