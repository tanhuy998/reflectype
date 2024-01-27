const { METADATA } = require("../../constants");
const { metadata_t, metaOf, prototype_metadata_t, property_metadata_t, wrapperOf } = require("../../reflection/metadata");
const { extractClassConstructorInfoBaseOnConfig } = require("../../utils/function.util");
const { DECORATED_VALUE } = require("../constant");
const { getMetadataFootPrintByKey } = require("../footPrint");
const { refreshTypeMetaObjectForDecoratorMetadata } = require("./metadataTrace");

const RESOLVED_CLASSES = new Set();

module.exports = {
    resolveTypeMetaResolution,
    recursiveResolveResolution,
};

/**
 *  Metadata resolution
 *  There are two situation that metadata resolution must be evaluated:
 *  - When an instance of a class is instantiated.
 *  - When a reflection read metadata of a class.
 *  Metadata resolution is evaluated on a class when the first of the above actions occurs.
 * 
 *  when classes inherit another, they would acquire it's base class type meta.
 *  There are no problems when a decorated class inherits another decorated class
 *  because decorators "know" (not yet) which class (decorator metadata context) that
 *  they're placed.
 *  Problems just comes when undecorated class inherit decorated class.
 *  When we reflect on an undecorated class that inherits decorated class, it's override
 *  properties on base's class decorated properties would be invalid convention.  
 *
 *  Two common types of the problem are:
 *  U <- D <- U   or   D <- U <- D
 *  
 *  => ...U <- ...D <- ...U   or  ...D <- ...U <- ...D 
 */

/**
 * 
 * @param {Function} _class 
 * @returns 
 */
function recursiveResolveResolution(_class) {
    
    if (RESOLVED_CLASSES.has(_class)) {

        return;
    }

    if (!(METADATA in _class)) {

        return;
    }

    const stack = [];

    while (_class !== Function.__proto__) {

        if (
            !(METADATA in _class) ||
            RESOLVED_CLASSES.has(_class)
        ) {

            break;
        }

        stack.push(_class);
        _class = _class.__proto__;
    }   

    manipulateMetaDependentClasses(stack);
}

function manipulateMetaDependentClasses(stack = [], limit) {

    if (stack.length <= 0) {

        return;
    }

    console.log('--------------------')
    while (stack.length) {

        const currentClass = stack.pop();
        const currTypeMeta = metaOf(currentClass);
        
        if (typeof currTypeMeta.loopback !== 'object') {

            const currentWrapper = wrapperOf(currentClass);

            Object.defineProperty(currentClass, METADATA, {
                value: Object.setPrototypeOf({}, currentWrapper)
            })
        }

        const typeMeta = metaOf(currentClass);
        typeMeta._constructor = extractClassConstructorInfoBaseOnConfig(currentClass);

        assignAbstractToTypeMeta(currentClass, typeMeta);
        unlinkIndependentPropeMeta(currentClass);
       
        RESOLVED_CLASSES.add(currentClass);
    }
}

/**
 * This function is used by decorator for the addInitializer()
 * when the decorator know and understand it's class and typeMeta placemnet.
 * 
 * @param {Function} _class
 * @param {metadata_t} _typeMeta 
 */
function assignAbstractToTypeMeta(_class, _typeMeta) {
    
    if (typeof _typeMeta.loopback !== 'object') {

        return;
    } 
    
    _typeMeta.abstract = _class;
    delete _typeMeta.loopback;
}

/**
 * This function is used by decorator for the addInitializer()
 * when the decorator know and understand it's class and typeMeta placemnet.
 * 
 * @param {Function} _class
 * @param {metadata_t} _typeMeta 
 */
function resolveTypeMetaResolution(_class) {

    recursiveResolveResolution(_class);
}

function unlinkIndependentPropeMeta(_class) {

    scanAndResolveStaticProperties(_class);
    scanAndResolvePrototypeProperties(_class);
}

function scanAndResolveStaticProperties(_class) {

    const meta = metaOf(_class);
    manipulateProperties(_class, meta);
}

function scanAndResolvePrototypeProperties(_class) {

    const meta = metaOf(_class)?._prototype;
    manipulateProperties(_class.prototype, meta);
}

/**
 * 
 * @param {Function} _class 
 * @param {metadata_t | prototype_metadata_t} meta 
 */
function manipulateProperties(_target, meta) {

    const properties = meta.properties;

    for (const [propName, propMeta] of Object.entries(properties) || []) {
        
        if (isMethodOverridenWithoutDecorattion.call(_target, propName, propMeta)) {
            // unlink the propMeta
            delete properties[propName];
        }
    }
}

/**
 * This method must be bound with the class or the class's
 * prototype object in order to compare private methods.
 * 
 * @param {string|symbol} methodName 
 * @param {property_metadata_t} propMeta 
 * 
 * @this Function|Object is the class or the class's prototype
 * 
 * @returns 
 */
function isMethodOverridenWithoutDecorattion(methodName, propMeta) {

    if (!propMeta.isMethod) {

        return false;
    }
    
    if (typeof this[methodName] !== 'function') {

        return false;
    }

    const ownerPropMetaClass = propMeta.owner?.typeMeta?.abstract;

    return  this !== ownerPropMetaClass &&
            this !== ownerPropMetaClass.prototype &&
            this[methodName] !== getMetadataFootPrintByKey(propMeta, DECORATED_VALUE);
}