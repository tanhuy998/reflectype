class InterfacePrototype {

    #interfaces;
    get list() {
        return this.#interfaces;
    }

    #prototype;
    #origin;
    get origin() {

        return this.#origin;
    }


    constructor(_origin , ..._interfaces) {

        this.#interfaces = new Set(_interfaces);
        this.#prototype = new Map();

        this.#origin = _origin;
        //this.#init();
    }

    // #init() {

    //     for (const intf of this.#interfaces.values()) {

    //         if (!isInterface(intf)) {

    //             throw new TypeError(`${intf.prototype.name} is not type of Interface`);
    //         }

    //         const props = Object.values(intf);

    //         for (const value of props) {

    //             if (typeof value !== 'function') continue;

    //             const prototype = this.#prototype;

    //             const paramsCount = countFunctionParams(value);

    //             const methodName = value.name;

    //             if (!prototype.has(methodName)) {

    //                 prototype.set(methodName, new Set());
    //             }

    //             const methodVariations = prototype.get(methodName);
    //         }
    //     }
    // }

    getPrototype() {

        return Array.from(this.#prototype);
    }

    verify(_object) {

        console.log(this.origin, this.#interfaces)

        for (const intf of this.#interfaces.values()) {

            //const methods = Object.getOwnPropertyNames(intf.prototype);
            const methods = intf.PROTOTYPE;

            console.log(methods)

            for (const method of methods) {
                
                if (method == "constructor") continue;

                if (!_object[method]) throw new TypeError(`class ${_object.realClassName} implements ${intf.name} but not defines '${method}' method`);

                if (typeof _object[method] !== 'function')  throw new TypeError(`class ${_object.realClassName} implements ${intf.name} but defines '${method}' as not type of function`);
            }
        }
    }
}

module.exports = InterfacePrototype;