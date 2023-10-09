const isPrimitive = require('../utils/isPrimitive.js');

function matchType(_type, value) {
    
    const transferToBoxedPrimitive = {
        'string': 'String',
        'boolean': 'Boolean',
        'number': 'Number',
        'bigint': 'BigInt'
    }

    // if _type is annotated as primitive types
    // is must be a boxed primitive
    if (isPrimitive(_type) && isPrimitive(value)) {
        
        if (_type.name === value?.name) {
            
            return true;
        }

        const strictType = transferToBoxedPrimitive[typeof value];
        
        return strictType === _type.name;
    }

    if (!isPrimitive(_type)) {
        
        if  (!isPrimitive(value)) {
            
            return (value[IS_CHECKABLE]) ? value.__is(_type) : value instanceof _type;
        }

        return false;
    }
}

module.exports = matchType;