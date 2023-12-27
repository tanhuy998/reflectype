const {metaOf, property_metadata_t} = require('../../reflection/metadata.js');
const ReflectionParameterAbstract = require('../abstract/reflectionParameterAbstract.js');
const ReflectionParameter = require('../parameter/reflectionFunctionParameter.js');

/**
 *  @typedef {import('../function/reflectionFunction.js')} ReflectionFunction
 *  @typedef {import('./reflectionPrototypeMethod.js')} ReflectionPrototypeMethod
 *  @typedef {import('../../reflection/metadata.js').property_metadata_t } property_metadata_t
 *  @typedef {import('../abstract/reflectionParameterAbstract.js')} ReflectionParameterAbstract
 *  @typedef {import('../abstract/abstractReflection.js')} AbstractReflection
 */

/**
 * @this AbstractReflection
 * 
 * @param {ReflectionParameterAbstract} _ReflectionParamClass 
 * @returns {Iterable<ReflectionParameterAbstract>}
 */
function reflectParameters(_ReflectionParamClass) {

    const propMeta = this.metadata;

    if (!(propMeta instanceof property_metadata_t)) {

        return undefined;
    }

    //const declaredParamsCount = this.target.length;
    const declaredParamTypes = propMeta.defaultParamsType?.length ?? 0;
    const declaredParamValues = propMeta.value?.length ?? 0;

    // const maxCount = max(declaredParamTypes, max(declaredParamsCount, declaredParamValues));
    const maxCount = max(declaredParamTypes, declaredParamValues);

    let ret;

    for (let i = 0; i < maxCount; ++i) {

        const reflection = new _ReflectionParamClass(this.target, propMeta.name, i)

        if (!reflection.isValid) {

            continue;
        }

        (ret ??= []).push(reflection);
    }

    return ret;
}

function max(left, right) {

    return left >= right ? left : right;
}


module.exports = {reflectParameters};