const IDisposable = require('../libs/iDisposable.js');
// const isAbStract = require('../utils/isAbstract.js');
// const getMetadata = require('../reflection/getMetadata.js');
const ReflectorContext = require('./reflectorContext.js');
const { metadata_t, metaOf, property_metadata_t } = require('../reflection/metadata.js');
//const { resolveResolutionFromArbitrayMeta } = require('../reflection/typeMetadataAction.js');
const { isInstantiable } = require('../libs/type.js');
const self = require('../utils/self.js');
const { resolveTypeMetaResolution } = require('../libs/metadata/resolution.js');

/**
 *  Reflector is the atomic unit of the reflecting progress.
 *  reflectors is supposed to be a valid reflection when the target object of reflectors
 *  contain metadatafiled.
 */
class Reflector extends IDisposable{

    /**@type {! metadata_t | property_metadata_t} */
    #metadata;

    /**@type {boolean} */
    #isValid = true;

    /**@type {boolean} */
    #isDisposed = false;

    /**@type {keyof ReflectorContext} */
    #context;

    #originClass;

    #target;

    get target() {

        return this.#target;
    }

    get originClass() {

        return this.#originClass;
    }

    get reflectionContext() {

        return this.#context;
    }

    /**
     *  @description this property check if a particular (or related) abstract has the correct metadata on its blueprint
     */
    get isValidReflection() {

        return this.#isValid;
    }

    get metadata() {

        return this.#metadata;
    }

    get isDisposed() {

        return this.#isDisposed;
    }


    /**
     * 
     * @param {Object} _unknown 
     */
    constructor(_unknown) {

        super();

        //this.#resolveMetadata(_unknown);
        this.#target = _unknown;
        this.#init();
    }

    #init() {

        this.#resolveMetadata();
        this.#applyMetadataResolution();   
    }

    #resolveMetadata() {

        const _target = this.#target;

        // if (isAbStract(_target)) {

        //     const typeMeta = metaOf(_target);

        //     this.#metadata = typeMeta;

        //     this.#context =  (typeMeta instanceof metadata_t) ? ReflectorContext.ABSTRACT : ReflectorContext.OTHER;

        //     this.#originClass = _target;
        // }
        // // when the _target of reflection is an instance of a particular class
        // else if (isAbStract(_target.constructor)) {
            
        //     this.#metadata = getMetadata(_target.constructor);

        //     this.#context = ReflectorContext.INSTANCE;

        //     this.#originClass = _target.constructor;
        // }
        // else if (metaOf(_target) instanceof Object) {

        //     this.#metadata = metaOf(_target)

        //     this.#context = ReflectorContext.OTHER;
        // }

        /**
         *  Short version of the above block
         */
        const _class = !isInstantiable(_target)? self(_target) : _target;
        
        this.#originClass = _class;
        this.#metadata = metaOf(_class) || metaOf(_target);
        this.#context = isInstantiable(_class) ? 
                        (_class === _target ? ReflectorContext.ABSTRACT : ReflectorContext.INSTANCE) 
                        : ReflectorContext.OTHER;

        this.#isValid = typeof this.#metadata === 'object';
        this.#isDisposed = !this.#isValid;
    }

    #applyMetadataResolution() {

        if (
            !this.isValidReflection ||
            this.reflectionContext === ReflectorContext.OTHER    
        ) {

            return;
        }
        
        //resolveResolutionFromArbitrayMeta(this.metadata, this.originClass);
        resolveTypeMetaResolution(this.#originClass, this.#metadata);
    }

    _dispose() {

        this.#metadata = undefined;

        this.#isDisposed = true;
    }
}

module.exports = Reflector;