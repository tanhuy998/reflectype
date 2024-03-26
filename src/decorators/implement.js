const { IS_CHECKABLE, METADATA } = require('../constants.js');
const Interface = require('../interface/interface.js');
const InterfacePrototype = require('../interface/interfacePrototype.js');
const { initTypeMeta } = require('../libs/classDecorator.js');
const { refreshTypeMetadata } = require('../libs/metadata/metadataTrace.js');
const { resolveTypeMetaResolution } = require('../libs/metadata/resolution.js');
//const initMetadata = require('../reflection/initMetadata');
//const initPrototypeMetadata = require('../reflection/initPrototypeMetadata');
const { metaOf, metadata_t, TYPE_JS } = require('../reflection/metadata');
const { markAsDecorator } = require('../utils/decorator/general.js');
const self = require('../utils/self.js');

module.exports = implement;

/**
 * 
 * @param  {...Interface} interfaces 
 * @returns 
 */
function implement(...interfaces) {

    checkInput(interfaces);

    function implementDecorator(_class, _context) {

        resolveInterfaceListResolution(interfaces);

        const {kind} = _context;

        if (kind !== 'class') {

            throw new Error('cannot apply @implement on non-class object'); 
        }
        
        if (_class.prototype instanceof Interface) {

            throw new TypeError('Interface could not implement another interface')
        }

        const typeMeta = initTypeMeta(_class, _context);
        handle(_class, _context, interfaces);
        resolveTypeMetaResolution(_class);
        
        return _class;
    }

    markAsDecorator(implementDecorator);
    return implementDecorator;
}

/**
 * 
 * @param {Array<Interface>} interfaceList 
 */
function resolveInterfaceListResolution(interfaceList = []) {

    for (const interface of interfaceList) {

        resolveTypeMetaResolution(interface);
    }
}

function checkInput(inputs) {

    for (const intf of inputs) {

        if (!(intf.prototype instanceof Interface)) {

            throw new TypeError(`${intf.name ?? intf} is not instance of [Interface]`);
        }
    }
}

function handle(_class, decoratorContext, _interfaces = []) {
    
    const {metadata} = decoratorContext;

    /**@type {metadata_t} */
    const classMeta = metadata[TYPE_JS];
    //const classMeta = refreshTypeMetadata(_class, decoratorContext);
    
    if (!classMeta.interfaces) {
    //|| isInterfacePrototypeConflict(_class)) {
        
        const interfaceProto = classMeta.interfaces = new InterfacePrototype(_class, _interfaces);
        interfaceProto.verify(_class);
    }
    else {
        
        classMeta.interfaces.approve(_interfaces);
    }

    alterClass(_class);
    alterClassPrototype(_class);
}

function alterClass(_class) {

    _class['__implemented'] = function(_abstract) {

        if (!isInterface(_abstract)) {
            
            return false;
        }
        
        return metaOf(this)?.interfaces.list.has(_abstract);
    }

    _class[IS_CHECKABLE] = true;
}

function alterClassPrototype(_class) {

    const classPrototype = _class.prototype;

    classPrototype[IS_CHECKABLE] ??= true;

    classPrototype['__is'] = function(_abstract) {
        
        if (!isInterface(_abstract)) {

            return this instanceof _abstract;
        }

        return self(this).__implemented(_abstract);
    }
}

// Obsoleted, refreshTypeMetadata() do this thing
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