/**
 * @typedef {import('../query/reflectionQuery')} ReflectionQuery
 * @typedef {import('../../reflection/metadata').property_metadata_t} property_metadata_t
 */

const { isObject, isObjectLike, isIterable, isPrimitive, isValuable, isNonIterableObjectKey } = require('../../libs/type');
const { property_metadata_t } = require('../../reflection/metadata');
const { isCriteriaOperator } = require('../../utils/criteriaOperator.util');
const CriteriaMode = require('./criteriaMode');
const { equal } = require('./criteriaOperator');


module.exports = class CriteriaResovler {

    /**
     * 
     * @param {ReflectionQuery} _query 
     * @param {any} _meta 
     * @returns {boolean}
     */
    static couldTransform(_query, _meta) {

        const metaIsObject = typeof _meta === 'object';
        
        if (isNonIterableObjectKey(_query.propName)) {
            
            return false;
        }
        else if (
            metaIsObject &&
            _query.field === 'properties'
        ) {
            
            return true;
        }

        return false;
    }

    /**
     * 
     * @param {ReflectionQuery} _query 
     * @returns {boolean}
     */
    static couldOperateQuery(_query) {

        const criteria = _query.criteria;
        const polarizeFilter = _query.options?.filter;
        
        return isObject(criteria) && Reflect.ownKeys(criteria).length > 0 ||
                Array.isArray(polarizeFilter) && polarizeFilter.length > 0;
    }

    #targetData;
    #query;
    #mode;

    #hasPolarizationFilter;

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

        const filter = this.#query?.options?.filter;
        this.#hasPolarizationFilter = Array.isArray(filter) && filter.length > 0;
    }

    /**
     * 
     * @param {ReflectionQuery} _query 
     * @param {property_metadata_t|Object|Iterable} _any 
     */
    resolve() {

        const targetData = this.#targetData;

        if (!Array.isArray(targetData)) {
            
            return this.#_resolveElement(targetData);
        }
        
        return this.#_iterateCriteria(targetData);
    }

    /**
     * 
     * @param {Array} list 
     * @param {Object} criteria 
     * 
     * @returns {Iterable}
     */
    #_iterateCriteria(list) {

        //return list?.filter(this.#_matchCriteria(criteria));

        let ret;

        for (const element of list || []) {

            const res = this.#_resolveElement(element);

            if (!isValuable(res)) {

                continue;
            }
            // console.log(res)
            (ret ||= []).push(res);
        }
        
        return ret;
    }

    #_resolveElement(element) {

        if (!this.#_matchCriteria(element)) {

            return undefined;
        }

        return this.#_transformElement(element);
    }

    #_transformElement(element) {
        
        element = this.#_resolvePolarization(element);
        
        return element;
    }

    #_resolvePolarization(element) {
        
        if (!this.#hasPolarizationFilter) {
            
            return element;
        }

        const polarizationFilter = this.#query.options.filter;
        const ret = {};

        for (const pol_prop of polarizationFilter) {
            
            if (!isNonIterableObjectKey(pol_prop)) {

                throw new TypeError('polarization prop must be type of either string or symbol');
            }

            if (!(pol_prop in element)) {

                return undefined;
            }

            ret[pol_prop] = element[pol_prop];
        }

        return ret;
    }

    /**
     * 
     * @param {Object} criteria 
     * @returns {boolean}
     */
    #_matchCriteria(element) {

        const criteria = this.#query?.criteria

        return check(criteria, this.#mode)(element);
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