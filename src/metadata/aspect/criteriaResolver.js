/**
 * @typedef {import('../query/reflectionQuery')} ReflectionQuery
 * @typedef {import('../../reflection/metadata').property_metadata_t} property_metadata_t
 */

const { isObject } = require('../../libs/type');

module.exports = class CriteriaResovler {

    #targetData;
    #query;

    /**
     * 
     * @param {ReflectionQuery} _query 
     * @param {Object|Function} _targetData 
     */
    constructor(_query, _targetData) {

        this.#query = _query;
        this.#targetData = _targetData;
    }

    /**
     * 
     * @param {ReflectionQuery} _query 
     * @param {property_metadata_t|Object|Iterable} _any 
     */
    #_resolve() {

        const criteria = this.#query?.criteria
        const targetData = this.#targetData;

        if (!isObject(criteria)) {

            return targetData;
        }

        if (targetData instanceof property_metadata_t) {

            return this.#_checkCriteria(targetData, criteria) ? targetData : undefined;
        }

        const iterable = 
    }

    /**
     * 
     * @param {Iterable} iterable 
     * @param {Object} criteria 
     * 
     * @returns {Iterable}
     */
    #_iterateCriteria(iterable, criteria) {

        let ret;

        for (const entry of iterable) {

            if (!(this.#_checkCriteria(entry, criteria))) {

                continue;
            }

            (ret ??= []).push(entry);
        }

        return ret;
    }

    /**
     * 
     * @param {Object|Function} _target 
     * @param {Object} criteria 
     * @returns {boolean}
     */
    #_checkCriteria(_target, criteria) {

        if (!isObjectLike(_target)) {

            return false;
        }

        for (const condition in criteria) {

            if (!(condition in _target)) {

                return false;
            }

            if (_target[condition] !== criteria[condition]) {

                return false;
            }
        }

        return true;
    }
}