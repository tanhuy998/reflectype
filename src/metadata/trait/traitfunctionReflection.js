const {metaOf} = require('../../reflection/metadata.js');
const ReflectionParameter = require('../ReflectionParameter.js');

/**
 *  @typedef {import('../reflectionFunction.js')} ReflectionFunction
 *  @typedef {import('./reflectionPrototypeMethod.js')} ReflectionPrototypeMethod
 *  @typedef {import('../../reflection/metadata.js').property_metadata_t } property_metadata_t
 */

/**@this  {ReflectionFunction | ReflectionPrototypeMethod}*/
function reflectParameters() {

    /**@type  {property_metadata_t}*/
    const reflector = metaOf(this.target);

    const declaredParamsCount = this.target.length;
    const declaredParamTypes = reflector.defaultParamsType?.length ?? 0;
    const declaredParamValues = reflector.value?.length ?? 0;

    const maxCount = max(declaredParamTypes, max(declaredParamsCount, declaredParamValues));

    const ret = [];

    for (let i = 0; i < maxCount; ++i) {

        ret.push(new ReflectionParameter(this.target, i));
    }

    return ret;
}

function max(left, right) {

    return left >= right ? left : right;
}


module.exports = {reflectParameters};