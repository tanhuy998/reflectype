const { markAsDecorator } = require("../utils/decorator/general");
const classDecorator = require('../libs/classDecorator');
const { preventNonInheritanceTakeEffect } = require("../abstraction/traitAbstractClass");
const { getMetadataFootPrintByKey, setMetadataFootPrint } = require("../libs/footPrint");
const { IS_ABSTRACT_CLASS } = require("../libs/keyword/constant");

markAsDecorator(abstract);

module.exports = abstract;

function abstract(_class, context) {

    if (context.kind !== 'class') {

        throw new Error('@asbtract decorator just affects on class');
    }

    const typeMeta = classDecorator.initTypeMeta(_class, context);

    if (getMetadataFootPrintByKey(typeMeta, IS_ABSTRACT_CLASS)) {

        throw new Error('apply @abstract on a class multiple time is not allowed');
    }
    
    setMetadataFootPrint(typeMeta, IS_ABSTRACT_CLASS);

    return class AbstractWrapperClass extends _class {

        get isWrapperClass() {

            return this.constructor === AbstractWrapperClass ? true : false;
        }

        constructor() {

            super();

            preventNonInheritanceTakeEffect.call(this, AbstractWrapperClass)
        }
    }
}