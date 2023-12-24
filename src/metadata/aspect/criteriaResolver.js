/**
 * @typedef {import('../query/reflectionQuery')} ReflectionQuery
 * @typedef {import('../../reflection/metadata').property_metadata_t} property_metadata_t
 */

const { isObject, isObjectLike, isIterable, isPrimitive } = require('../../libs/type');
const { property_metadata_t } = require('../../reflection/metadata');


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
    resolve() {

        const criteria = this.#query?.criteria
        const targetData = this.#targetData;

        if (!isObject(criteria)) {
            
            return targetData;
        }

        if (targetData instanceof property_metadata_t) {
            
            return this.#_checkCriteria(criteria)(targetData) ? targetData : undefined;
        }

        const queryList = this.#_convertIfIterable(targetData);

        return this.#_iterateCriteria(queryList, criteria);
    }

    /**
     * 
     * @param {Iterable?} _any 
     * @returns {Array}
     */
    #_convertIfIterable(_any) {

        if (isObjectLike(_any)) {

            return this.#_convertObject(_any);
        }

        if (isIterable(_any)) {

            return this.#_convertArray(_any);
        }
    }

    /**
     * 
     * @param {Object|Function} _obj 
     */
    #_convertObject(_obj) {

        let ret;

        for (const key in _obj) {

            (ret ??= []).push(_obj[key]);
        }

        return ret;
    }

    /**
     * 
     * @param {*} _any 
     * @returns 
     */
    #_convertArray(_any) {

        if (!Array.isArray(_any)) {

            return undefined;
        }

        return _any;
    }

    /**
     * 
     * @param {Array} list 
     * @param {Object} criteria 
     * 
     * @returns {Iterable}
     */
    #_iterateCriteria(list, criteria) {

        return list?.filter(this.#_checkCriteria(criteria));
    }

    /**
     * 
     * @param {Object} criteria 
     * @returns {boolean}
     */
    #_checkCriteria(criteria) {
        
        return function (element) {
            
            if (!isObjectLike(element)) {

                return false;
            }

            for (const [condIndex, condVal] of Object.entries(criteria)) {
                
                if (isIterable(element[condIndex]) || isIterable(condVal)) {

                    continue;
                }
                
                if (element[condIndex] !== condVal) {

                    return false;
                }
            }
            
            return true;
        }
    }
}