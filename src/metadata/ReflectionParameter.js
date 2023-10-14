const { property_metadata_t } = require('../reflection/metadata.js');
const Reflector = require('./reflector.js');
const ReflectorContext = require('./reflectorContext.js');

class ReflectionParameter extends Reflector {

    #isValid;

    #type;

    #value;

    #paramIndex;

    get isValid() {

        return this.#isValid;
    }

    get type() {

        return this.#type;
    }

    get defaultValue() {

        return this.#value;
    }

    get paramIndex() {

        return this.#paramIndex;
    }

    get hasType() {

        return this.#isValid ? Boolean(this.#type) : false;
    }

    get hasDefaultValue() {

        return this.#isValid ? Boolean(this.#value) : false;
    }

    constructor(_func, _index) {

        if (typeof _func !== 'function') {

            throw new TypeError('parameter _func must be a function');
        }

        if (typeof _index !== 'number') {

            throw new TypeError('parameter _index must be a number indicating the order of the function\'s param');
        }

        super(_func);

        this.#paramIndex = _index

        this.#init();

        super._dispose();
    }

    #init() {

        if (this.reflectionContext !== ReflectorContext.OTHER) {

            this.#isValid = false;

            return;
        }

        this.#isValid = true;

        /**@type {property_metadata_t} */
        const funcMeta = this.metadata;

        const index = this.#paramIndex;

        let {value, defaultParamsType} = funcMeta;

        value ??= [];
        defaultParamsType ??= [];

        this.#type = defaultParamsType[index];

        this.#value = value[index];
    }
}

module.exports = ReflectionParameter;