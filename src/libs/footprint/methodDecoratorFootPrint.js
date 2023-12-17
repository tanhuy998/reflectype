const { METADATA } = require("../../constants");
const { DECORATED_VALUE } = require("../constant");
const { isFuntion } = require("../type");
const { UPDATE } = require("./constant");
const PropertyDecoratorFootPrint = require("./propertyDecoratorFootPrint");

module.exports = class MethodDecoratorFootPrint extends PropertyDecoratorFootPrint {

    /**@type {Function} */
    #decoratedMethod;

    get isDecorated() {

        return this.d
    }

    get decoratedMethod() {

        return this.#decoratedMethod;
    }

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

    [UPDATE]() {

        if (this.has(DECORATED_VALUE)) {

            return;
        }

        const decoratorTarget = this.decoratorTarget;
        const meta = decoratorTarget[METADATA];
        
        meta[FOOTPRINT] = this.footPrintObject;
    }
}