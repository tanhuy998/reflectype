const isPrimitive = require('../utils/isPrimitive.js');
const Void = require('../type/void.js');
const {IS_CHECKABLE} = require('../constants.js');

function matchType(_type, value) {
    
    const transferToBoxedPrimitive = {
        'string': 'String',
        'boolean': 'Boolean',
        'number': 'Number',
        'bigint': 'BigInt',
        'undefined': Void.name,
    }
    
    // if _type is annotated as primitive types
    // is must be a boxed primitive
    if (isPrimitive(_type) && isPrimitive(value)) {
        
        if (_type.name === value?.name) {
            
            return true;
        }
        
        const strictType = value === null ? Void.name : transferToBoxedPrimitive[typeof value];
        
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