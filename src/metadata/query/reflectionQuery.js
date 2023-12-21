const { isObjectKey } = require("../../libs/type");
const { PROPERTIES } = require("./constant");
const ReflectionQuerySubject = require("./reflectionQuerySubject");

module.exports = class ReflectionQuery {

    #subject;
    /**@type {string?|Symbol?} */
    #propName;

    #field;

    get field() {

        return this.#field;
    }

    get subject() {

        return this.#subject;
    }

    /**@type {string|Symbol} */
    get propName() {

        return this.#propName;
    }

    constructor({
        subject, propName, field
    }) {

        this.#subject = subject;
        this.#propName = propName;
        this.#field = field;

        this.#init();
    }

    #init() {

        if (not([
            ReflectionQuerySubject.PROTOTYPE,
            ReflectionQuerySubject.STATIC,
            ReflectionQuerySubject.INTERFACE
        ].includes(this.#subject))) {

            this.#subject = ReflectionQuerySubject.STATIC
        }
    
        const fieldType = typeof this.#field;
        const propName = this.#propName;
        
        this.#field = (fieldType !== 'string' && fieldType !== 'symbol') && 
                        isObjectKey(propName) ?
                        PROPERTIES : this.#field;
    }
} 

function not(expression) {

    return !expression;
}