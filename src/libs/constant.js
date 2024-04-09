const CASTED_TYPE = Symbol('_casted_type');
const VPTR = Symbol('_casted_type');

module.exports = {
    FOOTPRINT: '_footPrint',
    DECORATED: 'isDecorated',
    TYPE: 'typeDecoratorApplied',
    DECORATED_VALUE: 'decoratedValue',
    ALTER_VALUE: '_alter_value',
    DISPATCH_FUNCTION: '_dispatch_function',
    ORIGIN_VALUE: 'originValue',
    DEFAULT_ARGS: 'defaultArgs',
    PARAM: 'methodParamsType',
    DECORATOR_APPLIED: '_decorator_applied',
    CASTED_TYPE: CASTED_TYPE,//Symbol('_casted_type'),
    VPTR: VPTR,//Symbol('_casted_type'),
    TYPE_ENFORCEMENT_TRAPS: {
        get(target, key) {
    
            if (
                key === VPTR
                || key === CASTED_TYPE
            ) {
    
                return this[key];
            }
    
            //restrictAbstractUndeclaredMethod(this[VPTR], target, key);
            const target_prop = target[key];
            return target_prop;
        },
        set(target, key, val) {
    
            if (
                key === VPTR
            ) {
                this[VPTR] = val;
            }
            else {
                target[key] = val;
            }
            
            return true;
        }
    }
}