const { compareArgsWithType } = require("../../libs/argumentType");
const { decoratorHasFootPrint, setDecoratorFootPrint } = require("../../libs/footPrint");
const { initMetadata } = require("../../libs/propertyDecorator");
const { isValuable, isAbstract } = require("../../libs/type");
const { property_metadata_t } = require("../../reflection/metadata");
const Any = require("../../type/any");

const PARAMS_DECORATED = 'paramDecorated';

module.exports = {
    mapList_validateInput,
    mapParamsByList,
    mapParamsByNames,
    prepareParamsDecorator
}

function prepareParamsDecorator(_, context) {

    const {kind} = context;

    if (kind !== 'method') {

        throw new Error('@paramsType just affect on method')
    }

    /**@type {property_metadata_t} */
    const propMeta = initMetadata(_, context);

    if (decoratorHasFootPrint(_, context, PARAMS_DECORATED)) {

        throw new Error('cannot apply @paramsType multiple times');
    }
    
    compareArgsWithType(propMeta);
    setDecoratorFootPrint(_, context, PARAMS_DECORATED);

    return propMeta;
}

function mapList_validateInput(_types = []) {   

    if (
        Array.isArray(_types) &&
        _types.length === 0
    ) {

        throw new Error('@paramsType must be passed at least 1 argument');
    }
}

/**
 * 
 * @param {Object} _table 
 * @param {property_metadata_t} propMeta 
 */
function mapParamsByNames(_typeTable, propMeta) {

    for (const name of propMeta.functionMeta.paramsName || []) {
        
        _registerType(_typeTable[name], propMeta);

        delete _typeTable[name];
    }
    
    mapName_checkUndeclaredParams(_typeTable);
}

function mapName_checkUndeclaredParams(undeclared) {
    
    if (Object.keys(undeclared).length > 0) {
        
        throw new ReferenceError('trying to define types for undeclared parameter');        
    }
}

function checkAndReturnValidType(type) {
    
    if (!isValuable(type)) {

        return Any;
    }
    else if (isAbstract(type)) {

        return type;
    }
    else {
        
        throw new Error();
    }
}

/**
 * 
 * @param {Array<Function>} _list 
 * @param {property_metadata_t} propMeta 
 */
function mapParamsByList(_list, propMeta) {
    
    for (const _type of _list) {

        _registerType(_type, propMeta);
    }
}

/**
 * 
 * @param {Function} type 
 * @param {property_metadata_t} propMeta 
 */
function _registerType(type, propMeta) {
    
    (propMeta.functionMeta.defaultParamsType ||= [])
    .push(checkAndReturnValidType(type));
}