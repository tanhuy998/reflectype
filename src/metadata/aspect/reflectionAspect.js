const { isObject, isObjectKey } = require("../../libs/type.js");
const { property_metadata_t } = require("../../reflection/metadata.js");
const ReflectionQueryBuilder = require("../query/reflectionQueryBuilder.js");
const ReflectionQuerySubject = require("../query/reflectionQuerySubject.js");
const methodDecorator = require('../../libs/methodDecorator.js');
const { ReflectionSubjectNotFoundError, ReflectionFieldNotFoundError } = require("../error/reflectionAspect.js");
const Reflector = require("../reflector.js");
const ReflectionQuery = require("../query/reflectionQuery.js");
const CriteriaResovler = require("./criteriaResolver.js");
const optionResolver = require("./optionResolver.js");

/**
 * @typedef {import('../query/reflectionQuery.js')} ReflectionQuery
 * @typedef {import("../reflector.js")} Reflector
 * @typedef {import('../../reflection/metadata.js').metadata_t} metadata_t
 * @typedef {import('../../reflection/metadata.js').prototype_metadata_t} prototype_metadata_t
 * @typedef {import('../../interface/interfacePrototype.js')} InterfacePrototype
 */

/**
 * ReflectionAspect is the evaluation of ReflectionQuery. It reads reflection query's properties,
 * therefore, retrieve piece(s) of metadata of a Reflector object.
 */
module.exports = class ReflectionAspect {

    #reflector;

    /**
     * 
     * @param {Reflector} reflector 
     */
    constructor(reflector) {

        this.#reflector = reflector;
        
        this.#init();
    }

    #init() {

        if (!(this.#reflector instanceof Reflector)) {

            throw new TypeError('invalid reflector');
        }
    }

    #isValidOrFail() {

        if (!this.#reflector.isValidReflection) {

            throw new Error();
        }
    }

    /**
     * 
     * @returns {ReflectionQueryBuilder}
     */
    query() {

        this.#isValidOrFail();

        return new ReflectionQueryBuilder(this);
    }

    /**
     * 
     * @param {ReflectionQuery} _query 
     * 
     * @returns {metadata_t|prototype_metadata_t|InterfacePrototype|property_metadata_t|Object}
     */
    execQuery(_query) {

        if (!(_query instanceof ReflectionQuery)) {

            throw new TypeError('invalid query');
        }

        this.#isValidOrFail();       

        return new optionResolver(_query, 
            new CriteriaResovler(_query, 
                this.#_resolvePropMeta(_query,
                    this.#_resolveField(_query, 
                        this.#_resolveSubject(_query)))).resolve())
                    .resolve();
    }

    /**
     * 
     * @param {ReflectionQuery} _query 
     * @returns {metadata_t|prototype_metadata_t|InterfacePrototype}
     */
    #_resolveSubject(_query) {

        const reflector = this.#reflector;
        
        if (!reflector.isValidReflection) {

            return undefined;
        }

        return _query.subject === ReflectionQuerySubject.STATIC ? 
                        reflector.metadata : reflector.metadata[_query.subject];
    }

    /**
     * 
     * @param {*} _query 
     * @param {*} _metaSubject 
     * 
     * @returns {Object}
     */
    #_resolveField(_query, _metaSubject) {

        if (!isObject(_metaSubject)) {

            throw new ReflectionSubjectNotFoundError();
        }

        const queryField = _query.field;

        if (!isObjectKey(queryField)) {

            return _metaSubject;
        }

        const metaField = _metaSubject[queryField];
        
        return metaField;
    }

    /**
     * 
     * @param {Object|any} subject 
     * @param {ReflectionQuery} _query 
     * 
     * @returns {property_metadata_t|Object}
     */
    #_resolvePropMeta(_query, _metaField) {

        if (!isObject(_metaField)) {

            throw new ReflectionFieldNotFoundError();
        }

        const queryProp = _query.propName;
        
        if (!isObjectKey(queryProp)) {

            return _metaField;
        }

        const propMeta = _metaField[queryProp];

        return propMeta;
    }
}