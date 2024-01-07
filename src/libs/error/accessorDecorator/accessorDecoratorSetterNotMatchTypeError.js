const AccessorDecoratorError = require("./accessorDecoratorError");

module.exports = class AccesorDecoratorSetterNotMatchTypeError extends AccessorDecoratorError {

    constructor(instance, propMeta) {

        const isStatic = propMeta.static;
        const expectPropValueType = propMeta.type;
        const propName = propMeta.name;

        super(`Cannot set value to${(isStatic? ' static' : '') + ' attribute '}${isStatic ? instance.name : instance.constructor.name}.${propName} that is not type of [${expectPropValueType.name}]`);
    }
}