const { reproduceReadableFunctionIndentifier } = require("../utils/stringGenerator");

module.exports = class ArgumentNotMatchError extends TypeError{

    constructor({type, value, paramName, metadata}) {
        
        type = type.name ?? type;
        const valueType = value?.constructor?.name ?? value;
        const funcIdentifier = reproduceReadableFunctionIndentifier(metadata);

        super(`The value passed to parameter "${paramName}" of ${funcIdentifier} is not type of [${type}], [${valueType}] given.`);
    }
}