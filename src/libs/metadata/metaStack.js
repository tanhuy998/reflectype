/**
 * @template {T}
 */
module.exports = class MetaStack {

    /**@type {T} */
    #type

    #stack = [];
    #entries = new Set();

    /**@type {T} */
    get head() {

        const length = this.#stack.length;
        
        if (!length) {

            return undefined;
        }
        else {

            return this.#stack[length - 1];
        }
    }

    get length() {

        return this.#stack.length;
    }

    constructor(_type) {

        this.#type = _type;
    }

    indexOf(entry) {

        if (!this.exist(entry)) {

            return undefined;
        }

        return this.#stack.findIndex(entry);
    }

    at(index) {

        if (isNaN(index)) {

            throw new Error('invalid value of index');
        }

        return this.#stack.at(index);
    }

    push(entry) {

        this.#checkExist(entry);
        this.#entries.add(entry);
        this.#stack.push(entry);
    }

    exist(entry) {

        return this.#entries.has(entry);
    }

    #checkExist(entry) {

        if (this.exist(entry)) {

            throw new Error('1');
        }

        const type = this.#type;

        if (!(entry instanceof type)) {

            throw new Error('2');
        }
    }
}