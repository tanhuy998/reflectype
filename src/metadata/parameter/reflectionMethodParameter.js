const { isObjectKey } = require("../../libs/type");
const Reflection = require("../reflection");

module.exports = class ReflectionMethodParameter extends Reflection {

    #methodKey;
    #index;

    #isValid;

    get isValid() {

        
    }

    constructor(_target, _methodKey, _index) {

        if (_index < 0) {

            throw new Error('');
        }

        if (!isObjectKey(_methodKey)) {

            throw new Error('');
        }

        super(_any);

        this.#index = _index;
        this.#methodKey = _methodKey;

        this.#init();
    }

    #init() {

        if (!super.isValidReflection) {

            this
        }
    }
}