

function isPrimitive(value) {

    const boxedPrimitiveTypes = ['Boolean', 'String', 'Number', 'BigInt'];

    return (typeof value !== 'object' && typeof value !== 'function') || value === null || boxedPrimitiveTypes.includes(value.name);
}

module.exports = isPrimitive