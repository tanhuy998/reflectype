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


    constructor(_origin , _interfaces = []) {

        this.#interfaces = new Set(_interfaces);
        this.#prototype = new Map();

        this.#origin = _origin;
        //this.#init();
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

            //console.log(methods)

            for (const method of methods) {
                
                if (method == "constructor") continue;

                if (!prototype[method]) throw new TypeError(`class [${_object.name}] implements [${intf.name}] but not defines '${method}' method`);

                if (typeof prototype[method] !== 'function')  throw new TypeError(`class [${_object.name}] implements [${intf.name}] but defines '${method}' is not type of function`);
            }
        }
    }
}

module.exports = InterfacePrototype;