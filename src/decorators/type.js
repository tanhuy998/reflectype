const propertyDecorator = require('../libs/propertyDecorator.js');
const footprint = require('../libs/footPrint.js');
const { TYPE, DECORATED_VALUE } = require('../libs/constant.js');

function type(_abstract) {

    preventImmediateValue(_abstract);

    return function handle(prop, context) {

        const propMeta = propertyDecorator.initMetadata(prop, context);
        const alreadyApplied = footprint.hasFootPrint(prop, context, TYPE)

        if (alreadyApplied) {

            throw new Error('cannot apply @type multiple times');
        }

        propMeta.type = _abstract;

        footprint.setFootPrint(prop, context, TYPE);
        
        return prop;
    }
}

function preventImmediateValue(_target) {

    if (typeof _target !== 'function' && !_target.prototype) {

        throw new TypeError('require a constructor, immediate value given');
    }
}

module.exports = type;