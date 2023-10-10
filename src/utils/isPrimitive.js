const Void = require('../type/void.js');

function isPrimitive(value) {

    const boxedPrimitiveTypes = ['Boolean', 'String', 'Number', 'BigInt', Void.name];

    return (typeof value !== 'object' && typeof value !== 'function') || value === null || value === undefined || boxedPrimitiveTypes.includes(value.name);
}

module.exports = isPrimitive