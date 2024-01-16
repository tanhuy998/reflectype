const { preventNonInheritanceTakeEffect } = require("../abstraction/traitAbstractClass")

module.exports = class Any {
    /**
     * when pass Any as parameter type
     * arguments in any types are approved
     */
    constructor() {

        preventNonInheritanceTakeEffect.call(this, Any);
    }
}


