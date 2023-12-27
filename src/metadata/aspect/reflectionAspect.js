const { isValuable, isObject, isObjectKey, isObjectLike } = require("../../libs/type.js");
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
 * Reflection class is the proxy between Reflector and other reflection types,
 * Reflection class provides a query interface for retrieving metadata about a specific class.
 * When a query accquired, Reflection instances will analyze which metadata belongs to the 
 * a specific property.
 */
module.exports = class ReflectionAspect {

    #reflector;

    get hasPrototype() {


    }

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

        /**@type {property_metadata_t|Object} */
        const metaObj = new optionResolver(_query, 
            new CriteriaResovler(_query, 
                this.#_resolvePropMeta(_query,
                    this.#_resolveField(_query, 
                        this.#_resolveSubject(_query)))).resolve())
                    .resolve();

        if (
            _query.propName &&
        metaObj instanceof property_metadata_t
        ) {

            return this.#_resovlePropMetaResolution(_query, metaObj);
        }
        else {

            return metaObj;
        }
    }

    /**
     * 
     * @param {property_metadata_t|any} prop 
     * @param {ReflectionQuery} _query 
     */
    #_resovlePropMetaResolution(_query, propMeta) {

        this.#_establishPropMeta(propMeta);

        return propMeta;
    }

    /**
     * 
     * @param {property_metadata_t} _propMeta 
     */
    #_establishPropMeta(_propMeta) {

        if (_propMeta.isMethod && _propMeta.isInitialized !== true) {

            const abstract = this.#reflector.target;

            methodDecorator.establishClassPrototypeMethod(abstract, _propMeta);
        }
    }

    /**
     * 
     * @param {ReflectionQuery} _query 
     * @returns {metadata_t|prototype_metadata_t|InterfacePrototype}
     */
    #_resolveSubject(_query) {

        const reflector = this.#reflector;

        return _query.subject === ReflectionQuerySubject.STATIC ? 
                        reflector.metadata : reflector.metadata[_query.subject];

        // if (!isObject(subject)) {

        //     throw new Error();
        // }
        //console.log(['subject'], _query.subject, subject);
        //return subject;
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
        //console.log(['field'], metaField)
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
        //console.log(['prop'], propMeta)
        return propMeta;
    }

    
}