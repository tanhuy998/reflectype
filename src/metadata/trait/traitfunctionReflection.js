const {property_metadata_t, function_metadata_t} = require('../../reflection/metadata.js');
const ReflectionParameterAbstract = require('../abstract/reflectionParameterAbstract.js');

/**
 *  @typedef {import('../function/reflectionFunction.js')} ReflectionFunction
 *  @typedef {import('./reflectionPrototypeMethod.js')} ReflectionPrototypeMethod
 *  @typedef {import('../../reflection/metadata.js').property_metadata_t } property_metadata_t
 *  @typedef {import('../abstract/reflectionParameterAbstract.js')} ReflectionParameterAbstract
 *  @typedef {import('../abstract/abstractReflection.js')} AbstractReflection
 *  @typedef {import('../abstract/reflectionParameterAbstract.js')} ReflectionParameterAbstract
 */

const LIST = Symbol('__list');

module.exports = {reflectParameters};

/**
 * @this ReflectionFunction
 * 
 * @param {ReflectionParameterAbstract} _ReflectionParamClass 
 * @returns {Iterable<ReflectionParameterAbstract>}
 */
function reflectParameters() {

    // const propMeta = this.metadata;

    // if (!(propMeta instanceof property_metadata_t)) {

    //     return undefined;
    // }

    // //const declaredParamsCount = this.target.length;
    // const declaredParamTypes = propMeta.defaultParamsType?.length ?? 0;
    // const declaredParamValues = propMeta.value?.length ?? 0;

    // // const maxCount = max(declaredParamTypes, max(declaredParamsCount, declaredParamValues));
    // const maxCount = max(declaredParamTypes, declaredParamValues);

    // let ret;

    // for (let i = 0; i < maxCount; ++i) {

    //     /**@type {ReflectionParameterAbstract} */
    //     const reflection = new _ReflectionParamClass(this.target, propMeta.name, i);

    //     (ret ??= []).push(reflection.isValid ? reflection : undefined);
    // }

    // return ret;

    const propMeta = this.metadata;

    if (!(propMeta instanceof property_metadata_t)) {

        return undefined;
    }

    const funcMeta = propMeta.functionMeta;
    const fnName = this.methodName;
    const targetOfReflection = this.originClass || this.target;
    const ReflectionParamClass = this._getReflectionParameterClass();

    return generateResult(targetOfReflection, funcMeta, ReflectionParamClass, fnName);
}

/**
 * 
 * @param {Function} target 
 * @param {function_metadata_t} funcMeta 
 * @param {typeof ReflectionParameterAbstract} RflClass 
 * @param {string} fnName 
 */
function generateResult(target, funcMeta, RflClass, fnName) {

    const paramsName = funcMeta.paramsName;
    const ret = []

    for (const name of paramsName || []) {

        const reflection = new RflClass(target, fnName, name) ;
        ret.push(reflection);
    }
    
    return ret;
}

function* iterate() {

    const iterator = this[LIST][Symbol.iterator]();
    let iteration = iterator.next();

    while (!iteration.done) {
        
        yield iteration.value;
        iteration = iterator.next();
    }
}

function max(left, right) {

    return left >= right ? left : right;
}