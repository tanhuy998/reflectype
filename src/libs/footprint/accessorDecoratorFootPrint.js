const { UPDATE } = require("./constant");
const PropertyDecoratorFootPrint = require("./propertyDecoratorFootPrint");

module.exports = class AccessorDecoratorFootPrint extends PropertyDecoratorFootPrint {

    constructor(_, context) {

        if (typeof _?.get !== 'function') {

            throw TypeError();
        }

        super(_, context);

        this.#init();
    }

    #init() {


    }

    [UPDATE]() {

        if (this.has(DECORATED_VALUE)) {

            return;
        }

        const {get} = this.decoratorTarget;
        const meta = get[METADATA];
        
        meta[FOOTPRINT] = this.footPrintObject;
    }
}