const { isObjectKey, isValuable } = require("../../libs/type");
const { PROPERTIES } = require("./constant");
const ReflectionQuerySubject = require("./reflectionQuerySubject");

module.exports = class ReflectionQuery {

    #criteria;

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

    get criteria() {

        return this.#criteria;
    }

    constructor({
        subject, propName, field, criteria
    }) {

        if (typeof criteria !== 'object' &&
        isValuable(criteria)) {

            throw new TypeError('criteria must be an object or kind of null');
        }

        this.#subject = subject;
        this.#propName = propName;
        this.#field = field;
        this.#criteria = criteria;

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

        if (Object.keys(this.#criteria).length === 0) {

            this.#criteria = undefined;
        }
    }
} 

function not(expression) {

    return !expression;
}