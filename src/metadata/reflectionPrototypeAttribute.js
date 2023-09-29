const ReflectionPrototypeProperty = require("./reflectionPrototypeProperty");


class ReflectionPrototypeAttribute extends ReflectionPrototypeProperty {

    /**@type {boolean} */
    #isValid = false;

    get isValid() {

        return this.#isValid;
    }

    constructor(_target, _attributeKey) {

        super(...arguments);

        this.#init();
    }

    #init() {

        if (!super.isValid) {

            return;
        }

        if (super.isMethod) {

            return;
        }

        this.#isValid = true;
    }
}

module.exports = ReflectionPrototypeAttribute;