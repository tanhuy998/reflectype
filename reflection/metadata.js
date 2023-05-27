const {IS_CHECKABLE} = require('../constant');
const PropertyType = require('./propertyType.js');

class PropertyReflectionMetadata {

    #type;
    #kind;
    //#value;
    #isPrivate;
    #isStatic;

    get isPrivate() {

        return this.#isPrivate
    }

    get kind() {

        return this.#kind;        
    }

    get type() {

        return this.#type;
    }

    // get value() {

    //     return  this.#value;
    // }

    setType(type) {

        if (this.#type) {

            return;
        }

        this.#type = type;
    }

    setKind(kind, _isPrivate = false, _isStatic = false) {

        if (this.#kind) {

            return;
        }

        this.#isPrivate = _isPrivate;
        this.#isStatic = _isStatic;
        this.#kind = kind;
    }

    constructor(context) {

        this.#bindContextArgs(context);
    }

    #bindContextArgs(context) {

        if (!context) return;

        const {kind, name} = context;

        this.#isPrivate = context.private;
        this.#isStatic = context.static;
    }
}

class MethodPropertyReflection extends PropertyReflectionMetadata {

    constructor(context) {

        super();

        this.#init(context);
    }

    #init(context) {

        //const {private, static} = context;

        this.setKind(PropertyType.METHOD, context.private, context.static);
    }
}

class FieldPropertyReflection extends PropertyReflectionMetadata {

    constructor(context) {

        super();

        this.#init(context);
    }

    #init(context) {

        //const {static, private} = context;

        this.setKind(PropertyType.FIELD, context.private, context.static);
    }
}

class ObjectReflection {

    #instance;
    #properties = new Map();
    #methods = new Map();

    get methods() {

        return this.#methods;
    }

    get instance() {

        return this.#instance
    }

    get properties() {

        return new Proxy(this.#properties, {
            get: function (target, prop) {

                if (target.has(prop)) {

                    return target.get(prop);
                }
                else {

                    return undefined;
                }
            },
            set: function() {

                return false;
            }
        });
    }

    constructor(_object) {

        this.#instance = _object;
    }

    setProperty(context) {

        const {name, kind} = context;

        switch(kind) {
            case 'accessor':
                this.#properties.set(name, new FieldPropertyReflection(context));
                break;
            case 'method':
                this.#properties.set(name, new MethodPropertyReflection(context));
                break;
            default:
                break;
        }
    }
}

module.exports = {ObjectReflection, MethodPropertyReflection, FieldPropertyReflection};
