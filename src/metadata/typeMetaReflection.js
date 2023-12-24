const ReflectionQuery = require("./query/reflectionQuery");
const ReflectionQueryBuilder = require("./query/reflectionQueryBuilder");
const ReflectionQuerySubject = require("./query/reflectionQuerySubject");
const ReflectionAspect = require("./aspect/reflectionAspect");
const Reflector = require("./reflector");
const ReflectorContext = require("./reflectorContext");
const Reflection = require("./refelction");

module.exports = class TypeMetadataReflection extends Reflection {


    get classPrototype() {

        if (!this.reflector.isValidReflection) {

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

        //const reflector = this.reflector;
        
        return new ReflectionAspect(this.reflector).execQuery(reflectionQuery);
    }

    get classStatic() {

        if (!this.reflector.isValidReflection) {

            return undefined;
        }

        if (not([
            ReflectorContext.ABSTRACT,
            ReflectorContext.INSTANCE
        ].includes(this.reflector.reflectionContext))) {

            return undefined;
        }

        const reflector = this.reflector;
        
        return new ReflectionAspect(reflector).execQuery(new ReflectionQuery());
    }

    get interfaces() {

        let reflectionQuery;

    }

    constructor(_reflectionTarget) {

        super(_reflectionTarget);

        this.#init();
    }

    #init() {

        
    }
}

function not(expr) {

    return !expr;
}