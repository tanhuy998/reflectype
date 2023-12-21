const { isValuable, isObject, isObjectKey } = require("../libs/type.js");
const { property_metadata_t } = require("../reflection/metadata.js");
const ReflectionQueryBuilder = require("./query/reflectionQueryBuilder.js");
const ReflectionQuerySubject = require("./query/reflectionQuerySubject.js");
const methodDecorator = require('../libs/methodDecorator.js');

/**
 * @typedef {import('./query/reflectionQuery.js')} ReflectionQuery
 * @typedef {import("./reflector.js")} Reflector
 * @typedef {import('../reflection/metadata.js').metadata_t} metadata_t
 * @typedef {import('../reflection/metadata.js').prototype_metadata_t} prototype_metadata_t
 * @typedef {import('../interface/interfacePrototype.js')} InterfacePrototype
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

        this.#isValidOrFail();       

        /**@type {property_metadata_t|Object} */
        const metaObj = this.#_resolvePropMeta(_query,
            this.#_resolveField(_query, 
                this.#_resolveSubject(_query)));
        

        if (_query.propName &&
        metaObj instanceof property_metadata_t) {

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
        const subject = _query.subject === ReflectionQuerySubject.STATIC ? 
                        reflector.metadata : reflector.metadata[_query.subject];

        if (!isObject(subject)) {

            throw new Error();
        }
        //console.log(['subject'], _query.subject, subject);
        return subject;
    }

    /**
     * 
     * @param {*} _query 
     * @param {*} _metaSubject 
     * 
     * @returns {Object}
     */
    #_resolveField(_query, _metaSubject) {

        const queryField = _query.field;

        if (!isObjectKey(queryField)) {

            return _metaSubject;
        }

        const metaField = _metaSubject[queryField];

        if (!isObject(metaField)) {

            throw new Error();
        }
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

        const queryProp = _query.propName;
        
        if (!isObjectKey(queryProp)) {

            return _metaField;
        }

        const propMeta = _metaField[queryProp];

        if (!isObject(propMeta)) {

            throw new Error();
        }
        //console.log(['prop'], propMeta)
        return propMeta;
    }
}