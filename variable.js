const {IS_CHECKABLE} = require('./constant.js');
const {preventImmediateValue} = require('./utils.js');

class Variable {

    #type;
    #value;
    #name;
    #isClassProperty;
    #isMethod;
    #class;
    #isStatic;

    get type() {

        return this.#type;
    }

    get value() {

        return this.#value;
    }

    constructor(_type, _value, _name, metadata = {class: undefined, isMethod, isStatic}) {

        this.#type = _type;
        this.#value = _value;
        this.#name = _name;
        this.#class = metadata.class;
        this.#isMethod = metadata.isMethod;
        this.#isStatic = metadata.isStatic;

        try {

            preventImmediateValue(this.#type);
        }
        catch (e) {
            
            throw new TypeError();
        }

        //if (this.#value === undefined) return;

        this.check();
    }

    

    setValue(_value) {

        this.#value = _value;

        this.check()
    }

    getValue() {

        return this.#value;
    }

    setClass(_class) {

        this.#class = _class;
    }

    check() {

        if (this.#value === undefined) return;

        const _type = this.#type

        if (this.#value[IS_CHECKABLE]) {

            if (!this.#value.__is(this.#type)) {

                throw new TypeError(`Initial value is not implements or type of ${_type.name}`);
            }
        }
        else {

            if (!(this.#value instanceof _type)) {

                throw new TypeError(`Initial value is not type of ${_type.name}`);
            }
        }
    }
}

module.exports = Variable;