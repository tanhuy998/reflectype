const {paramsType, returnType, type} = require('../../../index.js');
const allowNull = require('../../../decorators/allowNull.js');
const defaultArguments = require('../../../decorators/defaultArguments.js');
const parameters = require('../../../decorators/parameters.js');


class Z {}

class A extends Z {
    
    @type(Boolean)
    static accessor prop;

    //@paramsType(Boolean)
    @parameters({b: Boolean})
    static #func(a, b) {


    }
    

    @type(Number)
    accessor prop;

    @type(Number)
    accessor strProp;

    @allowNull
    @returnType(Number)
    //@defaultArguments(1)
    @paramsType(Number)
    func(a, b, ...c) {

        console.log('func', ...arguments)
    }

    test() {

        this.func(...arguments);
    }
}

class B extends A {


}

class C extends B {


}

class D extends C {

    
    @allowNull
    @paramsType(Boolean, Boolean)
    @returnType(Boolean)
    func(param1, param2) {

        console.log('B.func()', arguments)
    }
}

class E extends D {

    func() {


    }
}


class F extends E {

    
    @type(String)
    accessor prop
    
    @allowNull
    @paramsType(String, String)
    @returnType(String)
    func(param1, param2) {

        console.log('B.func()', arguments)
    }

    // func() {

    //     console.log('override without type');
    // }
}

class G extends F  {

    func() {

        console.log('func D');
    }
}

class H extends C {

    //@allowNull
    @returnType(Number)
    @parameters({
        a: [Function, allowNull],
        b: Number
    })
    func(a, b) {

        console.log('C', ...arguments)
    }
}


module.exports = {Z, A, B, C, D, E, F, G, H};
