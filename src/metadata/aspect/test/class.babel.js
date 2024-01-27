const {paramsType, returnType, type} = require('../../../index.js');
const allowNull = require('../../../decorators/allowNull.js');
const defaultArguments = require('../../../decorators/defaultArguments.js');
const parameters = require('../../../decorators/parameters.js');


class A {
    
    @type(Boolean)
    static accessor prop;

    @paramsType(Boolean)
    static #func(a) {


    }

    static anotherfunc() {


    }
    
    constructor(param1, param2) {


    }

    @type(Number)
    accessor prop;

    @type(String)
    accessor strProp;

    @allowNull
    @returnType(Number)
    //@defaultArguments(1)
    @paramsType(Number)
    func(a, b, c) {

        console.log('func', ...arguments)
    }

    test() {

        this.func(...arguments);
    }
}


module.exports = {A};
