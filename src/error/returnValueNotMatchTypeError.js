
class ReturnValueNotMatchType extends TypeError{

    constructor(_type, _value) {

        const valueType = _value?.constructor?.name ?? _value; 
        
        const type = _type.name ?? _type;
        //console.log(_value.constructor.name)

        super(`The return type of function not type of [${type}], [${valueType}] returned`);
    }
}

module.exports = ReturnValueNotMatchType;