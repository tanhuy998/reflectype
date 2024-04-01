const { isIterable } = require("../libs/type");
const { metaOf, property_metadata_t } = require("../reflection/metadata");
const self = require("../utils/self");
const Interface = require("./interface");

module.exports = class InterfacePrototype {

    /**@type {Map<typeof Interface, Function>} */
    #interfaces = new Map();

    /**@type {Array<Interface>} */
    #pool;

    /**@type {Map<typeof Interface, Function>} */
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

        for (const intf of this.#interfaces.keys()) {

            ret[intf.name] = intf;
        }

        return ret;
    }


    constructor(_origin , _interfaces = []) {

        //this.#interfaces = new Set(_interfaces);
        this.#pool = _interfaces;
        this.#prototype = new Map();

        this.#origin = _origin;
        this.#init();
    }

    
    clone(_additionalIntfs = []) {

        if (!isIterable(_additionalIntfs)) {

            throw new TypeError('_additionalIntfs must be an array of Interface classes');
        }

        const ret = new (self(this))(this.#origin, ..._additionalIntfs);
        ret.approve(this);

        return ret;
    }

    // approve(_additionalIntfs = []) {

    //     if (!isIterable(_additionalIntfs)) {

    //         throw new TypeError('_additionalIntfs must be an array of Interface classes');
    //     }

    //     if (_additionalIntfs.length === 0) {

    //         return;
    //     }

    //     for (const intf of _additionalIntfs) {

    //         this.#spliceInterface(intf);
    //     }
        
    //     this.#prepareInformations(_additionalIntfs);
    // }

    /**
     * 
     * @param {InterfacePrototype} interfaceProto 
     */
    approve(interfaceProto) {

        const list = interfaceProto.list;

        for (const [intf, origin] of list.entries()) {

            if (this.list.has(intf)) {

                continue;
            }

            this.list.set(intf, origin);
        }
    }

    /**
     * 
     * @param {typeof Interface} intf 
     */
    #spliceInterface(intf) {

        const intfList = this.#interfaces;

        while (intf !== Object.getPrototypeOf(Function)) {
            
            // if (!intfList.has(intf)) {

            //     intfList.add(intf);
            // }

            //this.#interfaces.add(intf);

            intfList.set(intf, this.#origin);
            intf.register(this.#origin);

            intf = Object.getPrototypeOf(intf);
        }
    }

    #init() {
        
        //this.#prepareInformations(this.#pool);
        this.#register();
    }

    #register() {

        for (const intf of this.#pool || []) {

            //this.#interfaces.set(intf, this.#origin);
            this.#spliceInterface(intf);
        }
    }

    // /**
    //  * 
    //  * @param {Iterable<Interface>} _Iterable 
    //  */
    // #prepareInformations(_Iterable) {

    //     for (const intf of _Iterable) {

    //         const prototype = intf.prototype;

    //         for (const methodName of intf.PROTOTYPE) {

    //             if (methodName === 'constructor') {

    //                 continue;
    //             }

    //             // const token = this.#encodeMethod(prototype[methodName], methodName);

    //             // this.#methods.add(token);
    //         }
    //     }
    // }

    // #encodeMethod(_func, _name) {

    //     /**@type {property_metadata_t} */
    //     const funcMeta = metaOf(_func);

    //     // if (!funcMeta) {

    //     //     return _name ?? _func.name;
    //     // }
        
    //     //const {name, allowNull, type, value} = funcMeta;

    //     const allowNull = funcMeta?.allowNull;
    //     const type  = funcMeta?.type;
    //     const name = funcMeta?.name;
    //     const value = funcMeta?.value;

    //     const encoded = `${allowNull}-${type?.name}-${name ?? _name ?? _func.name}-${Array.isArray(value) ? value.length : 0}`;

    //     /** the pattern is '[allowNull]-[type]-[funcName]-[args.length]' */
    //     return encoded;
    // }

    getPrototype() {

        return Array.from(this.#prototype);
    }

    verify(_object) {

        const prototype = _object.prototype;

        for (const intf of this.#interfaces.values()) {

            const methods = intf.PROTOTYPE;

            const token = this.#methods.values();

            /**@type {String} */
            for (const token of this.#methods.values()) {
                
                const [allowNull, type, methodName, argsLength] = token.split('-');

                if (methodName == "constructor") continue;

                if (!prototype[methodName]) throw new TypeError(`class [${_object.name}] implements [${intf.name}] but not defines ${methodName}() method`);

                if (typeof prototype[methodName] !== 'function')  throw new TypeError(`class [${_object.name}] implements [${intf.name}] but defines '${method}' is not type of function`);
            }
        }
    }
}