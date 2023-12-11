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

    constructor(_type) {

        this.#type = _type;
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