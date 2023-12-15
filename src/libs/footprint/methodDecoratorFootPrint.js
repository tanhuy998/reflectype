const { DECORATED_VALUE } = require("../constant");
const { isFuntion } = require("../type");
const PropertyDecoratorFootPrint = require("./propertyDecoratorFootPrint");

module.exports = class MethodDecoratorFootPrint extends PropertyDecoratorFootPrint {

    /**@type {Function} */
    #decoratedMethod;

    constructor(method, context) {

        const {kind} = context;
        
        if (kind !== 'method' || !isFuntion(method)) {

            throw new TypeError();
        }
        
        super(method, context);

        this.#init();
    }

    #init() {

        this.#decoratedMethod = super.get(DECORATED_VALUE);
    }

    set(_key, value = true) {

        super.set(_key, value);


    }
}