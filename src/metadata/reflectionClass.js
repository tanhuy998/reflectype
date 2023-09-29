const Reflector = require('./reflector.js');
const getMetadata = require('../reflection/getMetadata.js');
const getPrototypeMetadata = require('../reflection/getPrototypeMetadata.js')
const isAbastract = require('../utils/isAbstract.js');
const ReflectionProperty = require('./reflectionProperty.js');
const ReflectionPrototypeAttribute = require('./reflectionPrototypeAttribute.js');

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

        console.log(classProtoMeta)

        return [
            ...Reflect.ownKeys(classMeta)
                .map((_staticProp) => {

                    return new ReflectionProperty(abstract, _staticProp);
                })
                .filter((_reflector) => {

                    return _reflector.isValid;
                }),
            ...Reflect.ownKeys(classProtoMeta)
                .map((_protoProp) => {

                    return new ReflectionPrototypeAttribute(abstract, _protoProp);
                })
                .filter((_reflector) => {

                    return _reflector.isValid;
                })
        ].filter((element) => {

            return (element instanceof ReflectionProperty /*&& element.isValid */); 
        })
    }

    get methods() {


    } 

    constructor(_target) {

        super(_target);

        this.#targetAbstract = _target;

        this.#init();

        this._dispose();
    }

    #init() {

        if (!this.isValidReflection) {

            return;
        }

        if (!isAbastract(this.#targetAbstract)) {

            this.isValid = false;

            return;
        }

        this.#isValid = true;
    }

    _dispose() {


    }
}

module.exports = ReflectionClass;