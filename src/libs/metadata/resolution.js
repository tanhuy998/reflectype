const { metadata_t, metaOf, prototype_metadata_t, property_metadata_t } = require("../../reflection/metadata");
const { DECORATED_VALUE } = require("../constant");
const { getMetadataFootPrintByKey } = require("../footPrint");

module.exports = {
    resolveTypeMetaResolution,
};

/**
 * @param {Function} _class
 * @param {metadata_t} _typeMeta 
 */
function resolveTypeMetaResolution(_class, _typeMeta) {

    if (typeof _typeMeta.loopback !== 'object') {

        return;
    } 
    
    _typeMeta.abstract = _class;
    delete _typeMeta.loopback;

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