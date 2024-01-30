const { isObject, isObjectKey, isValuable, isNonIterableObjectKey } = require("../../libs/type.js");
const { property_metadata_t, metadata_t } = require("../../reflection/metadata.js");
const ReflectionQueryBuilder = require("../query/reflectionQueryBuilder.js");
const ReflectionQuerySubject = require("../query/reflectionQuerySubject.js");
const { ReflectionSubjectNotFoundError, ReflectionFieldNotFoundError } = require("../error/reflectionAspect.js");
const Reflector = require("../reflector.js");
const ReflectionQuery = require("../query/reflectionQuery.js");
const CriteriaResovler = require("./criteriaResolver.js");
const OptionResolver = require("./optionResolver.js");
const CriteriaMode = require("./criteriaMode.js");

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
module.exports = class MetadataAspect {

    #metaObj;

    #isValidMeta;
    #isLock;

    /**
     * 
     * @param {metadata_t} metadataObject 
     */
    constructor(metadataObject) {

        this.setMetadata(metadataObject);
    }

    #init() {

        try {
            this.#isValidOrFail();       
            this.#isValidMeta = true; 
        }
        catch {

            this.#isValidMeta = false;
        }
    }

    #isLockOrFail() {

        if (this.#isLock) {

            throw new ReferenceError('metadata is being queried, could not set the metadata');
        }
    }

    #lock() {

        this.#isLock = true;
    }

    #unLock() {

        this.#isLock = false;
    }

    /**
     * 
     * @param {metadata_t} metaObj 
     */
    setMetadata(metaObj) {

        this.#isLockOrFail();

        this.#metaObj = metaObj;
        this.#init();
    }

    #isValidOrFail() {

        if (!(this.#metaObj instanceof metadata_t)) {

            throw new TypeError('invalid metadata');
        }
    }

    /**
     * @param {Object} options 
     * @param {boolean} options.deepCriteria
     * @returns {ReflectionQueryBuilder}
     */
    query(options) {

        this.#lock();
        this.#isValidOrFail();
        return new ReflectionQueryBuilder(this, options);
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

        let ret;

        try {
            
            this.#isValidOrFail();
            
            const primaryMeta = this.#_resolvePrimaryPhase(_query);
            
            if (!isValuable(primaryMeta)) {

                //return undefined;
                throw undefined;
            }
            
            const secondaryMeta = this.#_resolveSecondaryPhase(_query, primaryMeta);
            
            if (!isValuable(secondaryMeta)) {

                //return undefined;
                throw undefined;
            }
            
            //return this.#_resolveTertiaryPhase(_query, secondaryMeta);
            ret = this.#_resolveTertiaryPhase(_query, secondaryMeta);
        }
        catch (e) {
            
            // return undefined;
            ret = undefined;
        }
        finally {

            this.#unLock();
            return ret;
        }
    }

    #_resolvePrimaryPhase(_query) {
        /**
         * Phase 1: resolve reflection query subject, field and target propMeta
         * of the metadata_t object
         */
        return this.#_resolvePropMeta(_query,
            this.#_resolveField(_query,
            this.#_resolveSubject(_query)));
    }

    #_resolveSecondaryPhase(_query, _primaryMeta) {
        /**
         * Phase 2: resolve criteria and polariztion.
         */
        const transformed = this.#_tranformMetaWhenNeccessary(_query, _primaryMeta);
        
        return new CriteriaResovler(_query, transformed).resolve();
    }

    #_resolveTertiaryPhase(_query, _secondaryMeta) {
        /**
         * Phase 3: resolve the rest options
         */
        return new OptionResolver(_query, _secondaryMeta).resolve();
    }

    /**
     * 
     * @param {ReflectionQuery} _query 
     * @param {any} _primaryMeta 
     */
    #_tranformMetaWhenNeccessary(_query, _primaryMeta) {
        
        if (CriteriaResovler.couldTransform(_query, _primaryMeta)) {
            
            return Object.values(_primaryMeta);
        }
        
        if (
            CriteriaResovler.couldOperateQuery(_query) &&
            isObject(_primaryMeta.properties)
        ) {
            
            return Object.values(_primaryMeta.properties);
        }
        
        return _primaryMeta;
    }

    /**
     * 
     * @param {ReflectionQuery} _query 
     * @returns {metadata_t|prototype_metadata_t|InterfacePrototype}
     */
    #_resolveSubject(_query) {

        const metadata = this.#metaObj;

        this.#isValidOrFail();

        return _query.subject === ReflectionQuerySubject.STATIC ? 
                        metadata : metadata[_query.subject];
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

        return _metaSubject[queryField];
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

        return _metaField[queryProp];
    }
}