const { reproduceReadableFunctionIndentifier } = require("../utils/string.util");

module.exports = class ReturnValueNotMatchType extends TypeError{

    constructor({type, value, metadata}) {

        type = type.name ?? type;
        const valueType = value?.constructor?.name ?? value; 
        const funcIdentifier = reproduceReadableFunctionIndentifier(metadata);

        super(`The return type of ${funcIdentifier} is not type of [${type}], [${valueType}] returned.`);
    }
}