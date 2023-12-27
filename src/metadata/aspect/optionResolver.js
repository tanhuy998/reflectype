
/**
 * @typedef {import('../query/reflectionQuery')} ReflectionQuery
 */

const { isObject, isIterable } = require('../../libs/type');

module.exports = class optionResolver {

    /**@type {ReflectionQuery} */
    #query;

    #meta;

    constructor(_query, _meta) {

        this.#query = _query;
        this.#meta = _meta;
    }

    resolve() {

        const options = this.#query?.options

        if (!isObject(options)) {

            return this.#meta;
        }

        if (options.onlyFirst === true) {

            return this.#_resolveFirstElement();
        }
    }

    #_resovleLimitElements() {


    }

    #_resolveToArray() {


    }

    #_resolveToSet() {


    }

    #_resolveFirstElement() {

        /**@type {Iterable} */
        const meta = this.#meta;

        if (!isIterable(meta)) {

            return meta;
        }

        if (Array.isArray(meta)) {

            return meta[0];
        }

        return meta[Symbol.iterator]().next().value;
    }
}