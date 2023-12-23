const ReflectionQuery = require("./query/reflectionQuery");
const ReflectionQueryBuilder = require("./query/reflectionQueryBuilder");
const ReflectionQuerySubject = require("./query/reflectionQuerySubject");
const ReflectionAspect = require("./aspect/reflectionAspect");
const Reflector = require("./reflector");
const ReflectorContext = require("./reflectorContext");

module.exports = class TypeMetadataReflection {

    #reflectionTarget;

    /**@type {Reflector} */
    #reflector;

    /**@type {Reflector} */
    get reflector() {

        return this.#reflector;
    }

    get reflectionContext() {

        return this.#reflector.reflectionContext;
    }

    get target() {
        
        this.#reflectionTarget;
    }

    get originClass() {

        return this.#reflector.originClass;
    }

    get isValidReflection() {

        return this.#reflector.isValidReflection
    }

    get isDisposed() {

        return this.#reflector.isDisposed;
    }

    get classPrototype() {

        if (!this.#reflector.isValidReflection) {

            return undefined;
        }

        let reflectionQuery;
        
        switch(this.reflectionContext) {
            case ReflectorContext.ABSTRACT:
                reflectionQuery = new ReflectionQueryBuilder()
                                    .from(ReflectionQuerySubject.PROTOTYPE)
                                    .build();
                break;
            case ReflectorContext.INSTANCE:
                reflectionQuery = new ReflectionQueryBuilder()
                                    .from(ReflectionQuerySubject.PROTOTYPE)
                                    .build();
                break; 
            case ReflectorContext.PROTOTYPE:
                reflectionQuery = new ReflectionQuery();
                break;
            default:
                return undefined;
        }

        const reflector = this.#reflector;
        
        return new ReflectionAspect(reflector).execQuery(reflectionQuery);
    }

    get classStatic() {


    }

    get interfaces() {

        let reflectionQuery;

    }

    constructor(_reflectionTarget) {

        this.#reflectionTarget = _reflectionTarget;

        this.#init();
    }

    #init() {

        const reflector = new Reflector(this.#reflectionTarget);

        if (!reflector.isValidReflection) {

            return;
        }

        this.#reflector = reflector;
    }
}