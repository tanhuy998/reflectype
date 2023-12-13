const { TYPE_JS, METADATA } = require("../reflection/metadata");
const { FOOTPRINT } = require("./constant");
const {isObjectOrFasle, isValuable} = require('./type.js');

/**
 * 
 * @param {Function|Object} _ 
 * @param {Object} context 
 * @returns 
 */
function initTypeMetaFootPrint(_, context) {

    const {kind, name, metadata} = context;

    const _propMeta = metadata[TYPE_JS]?.properties[name];

    if (typeof _propMeta !== 'object') {

        return;
    }

    if (typeof _propMeta.footPrint !== 'object') {

        _propMeta.footPrint = {};

        return;
    }

    const footPrint = _propMeta.footPrint ??= {};

    switch (kind) {
        case 'method':
            setFootPrintToFunction(_, footPrint);
            break;
        case 'accessor':
            setFootPrintToFunction(_.get, footPrint);
            break;
        default: 
            break;
    }

    return footPrint;
}

function setFootPrint(_, context, _key, _value = undefined) {

    const footPrintObject = initTypeMetaFootPrint(_, context);

    footPrintObject[_key] = _value || true;
}

/**
 * 
 * @param {Object | Function} _ 
 * @param {Object} context 
 * @param {string | undefined} _key 
 * @returns {boolean}
 */
function hasFootPrint(_, context, _key = undefined) {

    const {name, kind, metadata} = context;

    try {

        const typeMeta = metadata[TYPE_JS];
        isObjectOrFasle(typeMeta);

        const properties = typeMeta.properties;
        isObjectOrFasle(properties);

        const propMeta = properties[name];
        isObjectOrFasle(propMeta);

        const footPrint = propMeta[FOOTPRINT];
        isObjectOrFasle(footPrint);

        if(_key === undefined) {
            // if code pointer reach here, the footprint object exists
            return true;
        }

        switch(kind) {
            case 'method':
                return checkFootPrintOnMethod(_, footPrint, _key);
            case 'accessor':
                return checkFootPrintOnAccessor(_, footPrint, _key);
            default: 
                return footPrint[_key] === true;
        }
    }
    catch(e) {

        return false;
    }
}

function retrieveFootPrintObject(_, context) {

    const {kind} = context;

    switch(kind) {
        case 'method':
            return getFootPrint(_);
        case 'accessor':
            return getFootPrint(_.get);
        default:
            return;
    }
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
        isObjectOrFasle(methodFootPrintObject);

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
        isObjectOrFasle(meta);

        const footPrintObject = meta[FOOTPRINT];
        isObjectOrFasle(footPrintObject);

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
function setFootPrintToFunction(_func, _footPrint) {

    if (typeof _func !== 'function') {

        return;
    }

    const meta = _func[METADATA] ??= {};

    meta[FOOTPRINT] = _footPrint;
}

function retrieveFootPrintByKey(_, context, _key) {

    const footPrintObject = retrieveFootPrintObject(_, context);

    return footPrintObject[_key];
}

module.exports = {
    initTypeMetaFootPrint, 
    hasFootPrint, 
    retrieveFootPrintObject, 
    setFootPrint,
    retrieveFootPrintByKey,
    initFootPrint: initTypeMetaFootPrint
}