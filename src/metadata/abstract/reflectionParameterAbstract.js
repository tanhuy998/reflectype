const Reflection = require("../reflection");

module.exports = class ReflectionParameterAbstract extends Reflection {

    #isValid;

    get isValidReflection() {

        return this.#isValid;
    }

    constructor(_target) {

        super(_target);

        this.#init();
    }

    #init() {

        if (!super.isValidReflection) {
            /**
             * ensure metadata exist on the target
             */
            this.#isValid = false;
            return
        }

        this.#isValid = true;
    }
}