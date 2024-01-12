const { TYPE_JS, METADATA, property_metadata_t, prototype_metadata_t, metadata_t } = require("../reflection/metadata.js");
const { FOOTPRINT } = require("./constant.js");
const { retrievePropMeta, retrieveMetaObject } = require("./metadata/metadataTrace.js");
const {isObjectKeyOrFail, isValuable, isObjectKey, isObjectOrFail, isObject} = require('./type.js');

/**
 * Foot print is the way decorators detect if they took effect on a class's property.
 * It is a n object that store information of decorators and it is the important factor 
 * for decorators on determining the current property is owned by base class or derived class
 */

module.exports = {
    initFootPrint,
    initDecoratorFootPrint, 
    decoratorHasFootPrint, 
    retrieveDecoratorFootPrintObject, 
    setDecoratorFootPrint,
    retrieveDecoratorFootPrintByKey,
    initMetadataFootPrint,
    getMetadataFootPrintObject,
    getMetadataFootPrintByKey,
    metadataHasFootPrint,
    setMetadataFootPrint
}


/**
 * 
 */
function initFootPrint(_unknown) {

    switch(_unknown?.constructor) {
        case property_metadata_t:
            break;
        case prototype_metadata_t:
            break;
        case metadata_t:
            break;
        default:
            return initDecoratorFootPrint(...arguments);
    }

    return initMetadataFootPrint(_unknown);
}

/**
 * 
 * @param {Function|Object} _ 
 * @param {Object} context 
 * @returns 
 */
function initDecoratorFootPrint(_, context) {

    const metaObject = retrieveMetaObject(_, context);
    
    return initMetadataFootPrint(metaObject);
}

/**
 * 
 * @param {Object} metaObject 
 */
function initMetadataFootPrint(metaObject) {

    if (typeof metaObject !== 'object') {

        return;
    }

    return metaObject[FOOTPRINT] ??= {};
}

function metadataHasFootPrint(metaObj) {

    return isObject(getFootPrint(metaObj));
}

function getMetadataFootPrintObject(metaObj) {

    return getFootPrint(metaObj);
}

function getMetadataFootPrintByKey(metaObj, _key) {

    return getMetadataFootPrintObject(metaObj)?.[_key];
}

function setMetadataFootPrint(metaObj, key, value) {

    const footPrintObj = initMetadataFootPrint(metaObj);
    return footPrintObj[key] = isValuable(value) ? value : true;
}

function setDecoratorFootPrint(_, context, _key, _value) {

    const footPrintObject = initDecoratorFootPrint(_, context);
    return footPrintObject[_key] = isValuable(_value) ? _value : true;
}

/**
 * 
 * @param {Object | Function} _ 
 * @param {Object} context 
 * @param {string | undefined} _key 
 * @returns {boolean}
 */
function decoratorHasFootPrint(_, context, _key = undefined) {

    try {

        const footPrintObj = retrieveDecoratorFootPrintObject(_, context);
        isObjectKeyOrFail(footPrintObj);

        if (!isObjectKey(_key)) {

            return true;
        }

        return isValuable(footPrintObj[_key]);
    }
    catch(e) {

        return false;
    }
}

function retrieveDecoratorFootPrintObject(_, context) {
    
    return retrievePropMeta(_, context)?.[FOOTPRINT];
}

/**
 * 
 * @param {Function} method 
 * @param {Object} _footPrintObject 
 * @param {string} _key
 */
function checkFootPrintOnMethod(method, _footPrintObject, _key) {

    if (typeof method !== 'function') {

        return false;
    }
    
    try {

        const methodFootPrintObject = getFootPrint(method);
        isObjectOrFail(methodFootPrintObject);

        if (methodFootPrintObject !== _footPrintObject) {

            return false;
        }

        return isValuable(methodFootPrintObject[_key]);
    }
    catch(e) {

        return false;
    }
}

function getFootPrint(_unknown) {

    try {

        const meta = _unknown[METADATA];
        isObjectOrFail(meta);

        const footPrintObject = meta[FOOTPRINT];
        isObjectOrFail(footPrintObject);

        return footPrintObject;
    }
    catch(e) {

        return undefined;
    }
}

/**
 * 
 * @param {Object} accessor 
 * @param {Object} _footPrintObject 
 * @param {string} _key
 */
function checkFootPrintOnAccessor(accessor, _footPrintObject, _key) {

    const {get} = accessor;

    return checkFootPrintOnMethod(get, _footPrintObject, _key);
} 

/**
 * 
 * @param {Function} _method 
 * @param {Object} _footPrint 
 */
function setDecoratorFootPrintToFunction(_func, _footPrint) {

    if (typeof _func !== 'function') {

        return;
    }

    const meta = _func[METADATA] ??= {};

    meta[FOOTPRINT] = _footPrint;
}

function retrieveDecoratorFootPrintByKey(_, context, _key) {

    const footPrintObject = retrieveDecoratorFootPrintObject(_, context);

    return footPrintObject[_key];
}