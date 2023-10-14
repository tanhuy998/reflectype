const ReflectorContext = require("./reflectorContext.js");
const { property_metadata_t } = require("../reflection/metadata.js");
const Reflector = require("./reflector");
const {compareArgsWithType} = require('../libs/argumentType.js');

class ReflectionFunction extends Reflector {

    #isValid;
    
    #returnType;
    #defaultArgs;
    #argsType;
    #allowNull;

    get isValid() {

        return this.#isValid;
    }

    get returnType() {

        return this.#returnType;
    }

    get defaultArguments() {

        return this.#defaultArgs;
    }

    get allowReturnNull() {

        return this.#allowNull
    }

    get parameters() {


    }
 
    constructor(_function) {

        super(...arguments);

        this.#init();

        super._dispose();
    }

    #init() {

        if (!this.isValidReflection || this.reflectionContext !== ReflectorContext.OTHER) {
            
            this.#isValid = false;

            return;
        }

        /**@type {property_metadata_t} */
        const meta = this.metadata;

        if (!(meta instanceof property_metadata_t)) {
            
            this.#isValid = false;

            return;
        }

        const {type, value, defaultParamsType, allowNull} = meta;

        this.#returnType = type;
        this.#allowNull = allowNull;
        
        try {
            
            compareArgsWithType(meta);
            
            this.#defaultArgs = value;
            
            this.#isValid = true;
        }
        catch (error) {
            
            this.#isValid = false;
        }   
    }


}

module.exports = ReflectionFunction;