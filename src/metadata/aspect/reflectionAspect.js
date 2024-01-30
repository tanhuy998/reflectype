/**
 * @typedef {import('../query/reflectionQuery.js')} ReflectionQuery
 * @typedef {import("../reflector.js")} Reflector
 * @typedef {import('../../reflection/metadata.js').metadata_t} metadata_t
 * @typedef {import('../../reflection/metadata.js').prototype_metadata_t} prototype_metadata_t
 * @typedef {import('../../interface/interfacePrototype.js')} InterfacePrototype
 */

const Reflector = require('../reflector.js');
const MetadataAspect = require('./metadataAspect.js');

/**
 * ReflectionAspect is the evaluation of ReflectionQuery. It reads reflection query's properties,
 * therefore, retrieve piece(s) of metadata of a Reflector object.
 */
module.exports = class ReflectionAspect extends MetadataAspect {

    #reflector;

    /**
     * 
     * @param {Reflector} reflector 
     */
    constructor(reflector) {

        super();
        this.#reflector = reflector;
        this.#init();
    }

    #isValidOrFail() {

        if (!(this.#reflector instanceof Reflector)) {

            throw new TypeError('invalid reflector');
        }
    }

    #init() {

        this.#isValidOrFail();
        super.setMetadata(this.#reflector.metadata);
    }

    /**
     * @inheritdoc
     */
    query(options) {

        if (!this.#reflector.isValidReflection) {

            throw new Error('the reflector could not retrieve any metadata');
        }

        return super.query(options);
    }

    /**
     * @inheritdoc
     */
    execQuery(_query) {

        this.#isValidOrFail();
        return super.execQuery(_query);
    }

    setMetadata() {


    }
} 