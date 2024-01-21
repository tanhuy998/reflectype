/**
 * @typedef {import('../query/reflectionQuery')} ReflectionQuery
 * @typedef {import('../../reflection/metadata').property_metadata_t} property_metadata_t
 */

const { isObject, isObjectLike, isIterable, isPrimitive } = require('../../libs/type');
const { property_metadata_t } = require('../../reflection/metadata');
const { isCriteriaOperator } = require('../../utils/criteriaOperator.util');
const CriteriaMode = require('./criteriaMode');
const { equal } = require('./criteriaOperator');


module.exports = class CriteriaResovler {

    #targetData;
    #query;
    #mode;

    /**
     * 
     * @param {ReflectionQuery} _query 
     * @param {Object|Function} _targetData 
     */
    constructor(_query, _targetData) {

        this.#query = _query;
        this.#targetData = _targetData;
        this.#init();
    }

    #init() {

        this.#mode = this.#query.ReflectionQueryOptions.deepCriteria === true ?  CriteriaMode.DETAIL : CriteriaMode.SIMPLE;
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

        return check(criteria, this.#mode);
    }
}

function check(criteria, mode = CriteriaMode.DETAIL) {

    return function (element) {
        
        if (!isObject(criteria)) {

            return true;
        }

        if (!isObjectLike(element)) {

            return false;
        }

        for (const [condName, condVal] of Object.entries(criteria)) {

            if (isIterable(element[condName]) || isIterable(condVal)) {

                continue;
            }

            if (
                isObject(condVal) &&
                mode === CriteriaMode.DETAIL
            ) {
                
                if (Reflect.ownKeys(condVal).length === 0) {

                    continue;
                }

                if (!isObject(element[condName])) {

                    return false;
                }

                if (!check(condVal)(element[condName])) {

                    return false;
                }

                continue;
            }

            if (isCriteriaOperator(condVal)) {

                return condVal(element[condName]);
            }
            else { 

                return equal(condVal)(element[condName]);
            }
        }

        return true;
    }
}