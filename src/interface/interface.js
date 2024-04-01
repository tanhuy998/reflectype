const self = require('../utils/self');

/**@type {Map<Function, Set<Function>>} */
const REGISTRY = new Map();

/**
 * @typedef {import('./interfacePrototype.js')} InterfacePrototype
 */

/** @class */
class Interface {

    // static [Symbol.hasInstance](object) {

    //     if (typeof object !== 'object') {

    //         return false;
    //     }


    //     const { metaOf } = require('../reflection/metadata');
    //     const typeMeta = metaOf(object.constructor);

    //     if (!typeMeta) {
            
    //         return Object[Symbol.hasInstance].call(this, object);
    //     }

    //     /** @type {InterfacePrototype}*/
    //     const interfaceProto = typeMeta.interfaces;

    //     if (!interfaceProto) {

    //         return false;
    //     }
        
    //     return interfaceProto.list.has(this);
    // }

    static get PROTOTYPE() {

        return Object.getOwnPropertyNames(this.prototype);
    }

    /**
     * 
     * @param {Interface} intf 
     * @returns {boolean}
     */
    static hasRegistrySlotFor(intf) {

        return REGISTRY.has(intf);
    }

    /**
     * 
     * @param {Interface} intf 
     */
    static initRegistrySlotFor(intf) {

        if (this.hasRegistrySlotFor(this)) {

            return;
        }

        REGISTRY.set(intf, new Set());
    }

    /**
     * 
     * @param {Function} _class 
     * @returns {boolean}
     */
    static hasImplementer(_class) {

        this.initRegistrySlotFor(this);

        return REGISTRY.get(this).has(_class);
    }

    /**
     * 
     * @param {Function} implementer 
     */
    static register(implementer) {

        const { isInstantiable } = require('../libs/type');

        if (!isInstantiable(implementer)) {

            throw new TypeError();
        }

        this.initRegistrySlotFor(this);

        const ownedRegistry = REGISTRY.get(this);

        if (ownedRegistry.has(implementer)) {

            return;
        }

        ownedRegistry.add(implementer);
    }

    constructor() {

        throw new Error(`could not instantiate [${self(this)}] that inherits [Interface]`);
    }
}



module.exports = Interface;