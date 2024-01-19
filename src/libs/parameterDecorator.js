const { property_metadata_t, parameter_metadata_t, function_metadata_t } = require('../reflection/metadata');
const { generateMethodDecoratorContext, pseudo_parameter_decorator_context_t } = require('../utils/pseudoDecorator');
const propertyDecorator = require('./propertyDecorator');
const config = require('../../config.json');

module.exports = {
    initMetadata
}

/**
 * 
 * @param {any} _ 
 * @param {pseudo_parameter_decorator_context_t} context 
 * @returns 
 */
function initMetadata(_, context) {

    const {kind} = context;

    if (kind !== 'parameter') {

        throw new Error();
    }
    
    const propMeta = propertyDecorator.initMetadata(_, context);
    const paramMeta = resolveParamMeta(context, propMeta);

    return paramMeta;
}

/**
 * @param {pseudo_parameter_decorator_context_t} context
 * @param {property_metadata_t} propMeta 
 * @returns {parameter_metadata_t}
 */
function resolveParamMeta(context, propMeta) {

    const {name, index} = context;
    const funcMeta = propMeta.functionMeta ??= new function_metadata_t(propMeta);

    //manipulateParamListSpacing(index, funcMeta);
    
    const paramMeta = funcMeta.parameters[name] ??= new parameter_metadata_t(funcMeta);
    //const paramMeta = funcMeta.paramList[index] ??= new parameter_metadata_t(funcMeta);

    paramMeta.name = name;
    paramMeta.index = index;

    return paramMeta;
}

/**
 * @param {number} decoratorParamIndex
 * @param {function_metadata_t} funcMeta 
 */
function manipulateParamListSpacing(decoratorParamIndex, funcMeta) {

    const paramList = initParamList(funcMeta);
    funcMeta.paramList = paramList;

    if (indexInRangeOrFaill(decoratorParamIndex, paramList)) {

        return;
    }
    else if (
        funcMeta.isDiscovered === true &&
        config.parameterDecorator === false
    ) {
        /**
         * This case happens when thera is no official implementation
         * for parameter decorator.
         */
        throw new InvalidIndexError();
    }

    addParamListPadding(paramList);
}

/**
 * 
 * @param {function_metadata_t} funcMeta 
 */
function initParamList(funcMeta) {

    if (funcMeta.isDiscovered) {

        const pList = funcMeta.paramList;

        return (
            Array.isArray(pList) &&
            pList.length <= funcMeta.paramsName.length
        ) ? pList : new Array(funcMeta.paramsName.length);
    }

    return Array.isArray(funcMeta.paramList) ? funcMeta.paramList : [];
}

/**
 * 
 * @param {Array} paramList 
 * @param {number} size 
 */
function addParamListPadding(index, paramList) {

    const originLength = paramList.length;
    const paddingSize = index + 1 - originLength;

    while (paddingSize-- > 0) {

        paramList.push(undefined);
    }
}

/**
 * throw error when the index is less than 0.
 * Return true if index in list range,
 * false when index out of range.
 * 
 * @param {number} index 
 * @param {Array} list 
 * 
 * @throws {ReferenceError}
 */
function indexInRangeOrFaill(index, list) {

    if (index < 0) {

        throw InvalidIndexError();
    }

    return index >= 0 && index < list.length - 1;
}

function InvalidIndexError() {

    return new ReferenceError('invalid parameter decorator index');
}