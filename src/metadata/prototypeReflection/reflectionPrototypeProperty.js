const { property_metadata_t } = require('../../reflection/metadata.js');
const ReflectionQuerySubject = require('../query/reflectionQuerySubject.js');
const ReflectionPropertyAbstract = require('../abstract/reflectionPropertyAbstract.js');
const { resolvePropertyMetadata } = require('../trait/traitPropertyReflection.js');

/**
 *  ReflectionPrototypeProperty focus on reading metadata of the prototype.
 *  because the fact that, with ReflectionProperty, we cannot reach the class's prototype's
 *  metadata without instantiating an object of a specific class.
 *  ReflectionPrototypeProperty instantiating object is not neccessary, just directly apply reflection
 *  on class to get info about the class's prototype.
 */
module.exports = class ReflectionPrototypeProperty extends ReflectionPropertyAbstract {

    /**
     * 
     * @param {any} _target 
     * @param {string || Symbol} _attributekey 
     */
    constructor(_target, _attributeKey) {

        super(_target, _attributeKey);   

        //this.#init();
        //this.reflector._dispose();
    }

    _resolveAspectOfReflection() {

        if (!super.isValid) {

            return undefined;
        }

        return super.mirror()
        .select(this.name)
        .from(ReflectionQuerySubject.PROTOTYPE)
        .retrieve()
        ?? resolvePropertyMetadata.call(this, this.name);
    }
}