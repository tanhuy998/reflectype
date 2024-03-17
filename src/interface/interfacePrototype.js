const { isIterable } = require("../libs/type");
const { metaOf, property_metadata_t } = require("../reflection/metadata");
const self = require("../utils/self");
const Interface = require("./interface");

module.exports = class InterfacePrototype {

    /**@type {Set<Interface>} */
    #interfaces;

    /**@type {Array<Interface>} */
    #pool;

    /**@type {Set<Interface>} */
    get list() {
        return this.#interfaces;
    }

    get all() {

        return this.#pool;
    }

    /**
     * store the encoded tokens of method that the origin class must implements
     */
    #methods = new Set();

    #prototype;
    #origin;
    get origin() {

        return this.#origin;
    }

    /**
     * for Reflection query
     */
    get properties() {

        const ret = {};

        for (const intf of this.#interfaces.values()) {

            ret[intf.name] = intf;
        }

        return ret;
    }


    constructor(_origin , _interfaces = []) {

        this.#interfaces = new Set(_interfaces);
        this.#pool = _interfaces;
        this.#prototype = new Map();

        this.#origin = _origin;
        this.#init();
    }

    
    clone(_additionalIntfs = []) {

        if (!isIterable(_additionalIntfs)) {

            throw new TypeError('_additionalIntfs must be an array of Interface classes');
        }

        return new (self(this))(this.#origin, [...Array.from(this.#interfaces), ..._additionalIntfs])
    }

    approve(_additionalIntfs = []) {

        if (!isIterable(_additionalIntfs)) {

            throw new TypeError('_additionalIntfs must be an array of Interface classes');
        }

        if (_additionalIntfs.length === 0) {

            return;
        }

        for (const intf of _additionalIntfs) {

            this.#spliceInterface(intf);
        }
        
        this.#prepareInformations(_additionalIntfs);
    }

    #spliceInterface(intf) {

        const intfList = this.#interfaces;

        while (intf !== Object.getPrototypeOf(Function)) {
            
            if (!intfList.has(intf)) {

                intfList.add(intf);
            }

            //this.#interfaces.add(intf);

            intf = Object.getPrototypeOf(intf);
        }
    }

    #init() {
        
        this.#prepareInformations(this.#interfaces.values());
    }

    /**
     * 
     * @param {Iterable<Interface>} _Iterable 
     */
    #prepareInformations(_Iterable) {

        for (const intf of _Iterable) {

            const prototype = intf.prototype;

            for (const methodName of intf.PROTOTYPE) {

                if (methodName === 'constructor') {

                    continue;
                }

                const token = this.#encodeMethod(prototype[methodName], methodName);

                this.#methods.add(token);
            }
        }
    }

    #encodeMethod(_func, _name) {

        /**@type {property_metadata_t} */
        const funcMeta = metaOf(_func);

        // if (!funcMeta) {

        //     return _name ?? _func.name;
        // }
        
        //const {name, allowNull, type, value} = funcMeta;

        const allowNull = funcMeta?.allowNull;
        const type  = funcMeta?.type;
        const name = funcMeta?.name;
        const value = funcMeta?.value;

        const encoded = `${allowNull}-${type?.name}-${name ?? _name ?? _func.name}-${Array.isArray(value) ? value.length : 0}`;

        /** the pattern is '[allowNull]-[type]-[funcName]-[args.length]' */
        return encoded;
    }

    getPrototype() {

        return Array.from(this.#prototype);
    }

    verify(_object) {

        //console.log(this.origin, this.#interfaces)

        const prototype = _object.prototype;

        for (const intf of this.#interfaces.values()) {

            //const methods = Object.getOwnPropertyNames(intf.prototype);
            const methods = intf.PROTOTYPE;

            const token = this.#methods.values();


            //console.log(methods)

            /**@type {String} */
            for (const token of this.#methods.values()) {
                
                const [allowNull, type, methodName, argsLength] = token.split('-');

                if (methodName == "constructor") continue;

                if (!prototype[methodName]) throw new TypeError(`class [${_object.name}] implements [${intf.name}] but not defines ${methodName}() method`);

                if (typeof prototype[methodName] !== 'function')  throw new TypeError(`class [${_object.name}] implements [${intf.name}] but defines '${method}' is not type of function`);
                
                // const objectMethod = prototype[methodName];

                // const objectMethodToken = this.#encodeMethod(objectMethod);

                // console.log(objectMethodToken, token)

                // if (objectMethodToken !== token) {

                //     throw new Error(`The difinition of [${_object.name}].${methodName} not match the Interface`);
                // }
            }
        }
    }
}

//module.exports = InterfacePrototype;