
class ArgumentNotMatchError extends TypeError{

    constructor(_type, _value) {

        const valueType = _value?.constructor?.name ?? _value; 

        const type = _type.name ?? _type;
        //console.log(_value.constructor.name)

        super(`The argument passed to function not type of [${type}], [${valueType}] given`);
    }
}

module.exports = ArgumentNotMatchError;