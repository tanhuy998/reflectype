const { isFuntion } = require('../../libs/type.js');
const { property_metadata_t, metaOf } = require('../../reflection/metadata.js');
const ReflectionParameterAbstract = require('../abstract/reflectionParameterAbstract.js');
const ReflectorContext = require('../reflectorContext.js');

module.exports = class ReflectionFunctionParameter extends ReflectionParameterAbstract {

    constructor(_func, _index) {

        if (typeof _func !== 'function') {

            throw new TypeError('parameter _func must be a function');
        }

        super(_func, _index);
    }

        /**
     * @override
     * 
     * @returns {property_metadata_t?}
     */
    _resovleFunctionMetadata() {

        if (
            super.reflectionContext !== ReflectorContext.OTHER || 
            !isFuntion(super.target)
        ) {

            return undefined;
        }

        return metaOf(super.target);
    }
}