const Reflector = require('./reflector.js');
const getMetadata = require('../reflection/getMetadata.js');
const getPrototypeMetadata = require('../reflection/getPrototypeMetadata.js')
const isAbastract = require('../utils/isAbstract.js');
const ReflectionProperty = require('./reflectionProperty.js');
const ReflectionPrototypeAttribute = require('./reflectionPrototypeAttribute.js');
const ReflectionPrototypeMethod = require('./reflectionPrototypeMethod.js');
const { metaOf, METADATA, TYPE_JS } = require('../reflection/metadata.js');

class ReflectionClass extends Reflector {

    #isValid;

    #targetAbstract;


    get isValid() {

        return this.#isValid;
    }

    get attributes() { 

        if (!this.#isValid) {

            return undefined;
        }

        const abstract = this.#targetAbstract

        const classMeta = getMetadata(abstract)?.properties;
        const classProtoMeta = getPrototypeMetadata(abstract)?.properties;

        //console.log(classProtoMeta)

        return [
            ...Reflect.ownKeys(classMeta)
                .map((_staticProp) => {

                    return new ReflectionProperty(abstract, _staticProp);
                })
                .filter((_reflector) => {

                    return _reflector.isValid && !_reflector.isMethod;
                }),
            ...Reflect.ownKeys(classProtoMeta)
                .map((_protoProp) => {

                    return new ReflectionPrototypeAttribute(abstract, _protoProp);
                })
                .filter((_reflector) => {

                    return _reflector.isValid;
                })
        ];
        // .filter((element) => {

        //     return (element instanceof ReflectionProperty /*&& element.isValid */); 
        // })
    }

    get methods() {

        if (!this.#isValid) {

            return undefined;
        }

        const abstract = this.#targetAbstract

        const classMeta = getMetadata(abstract)?.properties;
        const classProtoMeta = getPrototypeMetadata(abstract)?.properties;

        const unInitialStaticMethods = this.#resovleUninitialMethodMetadata({fromStatic: true});
        const unInitialPrototypeMethods = this.#resovleUninitialMethodMetadata();

        return [
            // resolve from static 
            ...Reflect.ownKeys(classMeta)
                .map((_staticProp) => {
                    
                    return new ReflectionProperty(abstract, _staticProp);
                })
                .filter((_reflector) => {

                    return _reflector.isValid && _reflector.isMethod;
                }),
            // resolve from prototype
            ...Reflect.ownKeys(classProtoMeta)
                .map((_protoProp) => {
                    
                    return new ReflectionPrototypeMethod(abstract, _protoProp);
                })
                .filter((_reflector) => {

                    return _reflector.isValid;
                }),
            ...unInitialStaticMethods.filter(reflector => reflector.isValid && reflector.isMethod),
            ...unInitialPrototypeMethods.filter(reflector => reflector.isValid)
        ];
    } 

    constructor(_target) {

        super(_target);

        this.#targetAbstract = _target;

        this.#init();

        this._dispose();
    }

    #init() {

        if (!this.isValidReflection || !isAbastract(this.#targetAbstract)) {

            this.isValid = false;

            return;
        }

        this.#isValid = true;
    }

    #resovleUninitialMethodMetadata({fromStatic} = {}) {

        const abstract = this.#targetAbstract;

        const targetObject = fromStatic ? abstract : abstract.prototype;
        const targetMeta = fromStatic ? getMetadata(abstract)?.properties : getPrototypeMetadata(abstract)?.properties;
        
        return Reflect.ownKeys(targetObject)
        .filter((_key) => {

            if (_key === METADATA || _key === 'constructor') {

                return false;
            }
            
            if (!targetMeta || !targetMeta.properties) {

                return true;
            }

            if (targetMeta.properties[_key]) {

                return false;
            }
        })
        .map((_key) => {
            
            return fromStatic ? new ReflectionProperty(abstract, _key) : new ReflectionPrototypeMethod(abstract, _key);
        });
    }


    _dispose() {


    }
}

module.exports = ReflectionClass;