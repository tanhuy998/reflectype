const { IS_CHECKABLE } = require('../constants.js');
const Interface = require('../interface/interface.js');
const InterfacePrototype = require('../interface/interfacePrototype.js');
const initMetadata = require('../reflection/initMetadata');
const initPrototypeMetadata = require('../reflection/initPrototypeMetadata');
const { metaOf, metadata_t } = require('../reflection/metadata');

function implement(...interfaces) {

    checkInput(interfaces);

    return function (_class, _context) {

        const {kind} = _context;

        if (kind !== 'class') {

            throw new Error('cannot apply @implement on non-class object'); 
        }

        initPrototypeMetadata(_class);

        handle(_class, interfaces);

        return _class;
    }
}

function checkInput(inputs) {

    for (const intf of inputs) {

        if (!(intf.prototype instanceof Interface)) {

            throw new TypeError(`${intf.name ?? intf} is not instance of [Interface]`);
        }
    }
}

function handle(_class, _interfaces = []) {

    /**@type {metadata_t} */
    const classMeta = metaOf(_class);

    let interfaceProto;

    //classMeta.interfaces = interfaceProto;

    if (!classMeta.interfaces || isInterfacePrototypeConflict(_class)) {

        interfaceProto = classMeta.interfaces = new InterfacePrototype(_class, _interfaces);

        interfaceProto.verify(_class);
    }
    else {

        _interfaces.forEach(intf => {

            classMeta.interfaces.list.add(intf);
        })
    }

    alterClass(_class);

    alterClassPrototype(_class);
}

function alterClass(_class) {

    const classMeta = metaOf(_class);

    _class['__implemented'] ??= function(_abstract) {

        if (!isInterface(_abstract)) {
            
            return false;
        }

        return metaOf(this)?.interfaces.list.has(_abstract);
    }

    _class[IS_CHECKABLE] ??= true;
}

function alterClassPrototype(_class) {

    const classPrototype = _class.prototype;

    const classMeta = metaOf(_class);
    const interfaceProto = classMeta.interfaces;

    classPrototype[IS_CHECKABLE] ??= true;

    classPrototype['__is'] ??= function(_abstract) {
        
        if (!isInterface(_abstract)) {

            return this instanceof _abstract;
        }

        return _class.__implemented(_abstract);
    }
}

function isInterfacePrototypeConflict(_class) {

    /**
     *  _class[INTERFACE_PROTOTYPE] is public static property
     *  Classes that extend other class will inherit that property
     *  we need to check for the existence of _class[INTERFACE_PROTOTYPE] 
     *  in order to overide that property
     */

    const interfacePrototype = metaOf(_class).interfaces;

    if (interfacePrototype) {

        // when the existent interface prototype if not the class
        // that mean we need to overload the _class[INTERFACE_PROTOTYPE]
        if (interfacePrototype.origin !== _class) {

            return true;
        }
        else {

            return false;
        }
    }
    else {

        return false;
    }
}

function isInterface(_class) {

    return _class.prototype instanceof Interface;
}

module.exports = implement;