const {paramsType, returnType, type} = require('../../src/');
const {METADATA, TYPE_JS} = require('../../src/constants.js');
const allowNull = require('../../src/decorators/allowNull.js');
const defaultArguments = require('../../src/decorators/defaultArguments.js');
const parameters = require('../../src/decorators/parameters.js');
const overload = require('../../src/decorators/overload.js');
const { ORIGIN } = require('../../src/libs/metadata/constant.js');
const { METHOD } = require('../../src/libs/methodOverloading/constant.js');
const Any = require('../../src/type/any.js');

const stack = [];
const entries = new Set();

class Z {}

// class A extends Z {
    
//     @type(Boolean)
//     static accessor prop;

//     // // //@paramsType(Boolean)
//     // @parameters({b: Boolean})
//     // static #func(a, b) {


//     // }
    

//     @type(Number)
//     accessor prop;

//     @type(Number)
//     accessor strProp;

//     @allowNull
//     @returnType(Number)
//     //@defaultArguments(1)
//     @paramsType(Number)
//     func(a, b) {

//         console.log('func', ...arguments)
//     }

//     test() {

//         this.func(...arguments);
//     }
// }

// class B extends A {

//     func() {}
// }

// class C extends B {


// }

// class D extends C {

    
//     @allowNull
//     @paramsType(Boolean, Boolean)
//     @returnType(Boolean)
//     func(param1, param2) {

//         console.log('B.func()', arguments)
//     }
// }

// class E extends D {

//     accessor prop 

//     func() {


//     }
// }


// class F extends E {

    
//     @type(String)
//     accessor prop
    
//     @allowNull
//     @paramsType(String, String)
//     @returnType(String)
//     func(param1, param2) {

//         console.log('B.func()', arguments)
//     }

//     // func() {

//     //     console.log('override without type');
//     // }
// }

// class G extends F  {

//     func() {

//         console.log('func D');
//     }
// }

class T {

    @parameters({
        a: Number
    })
    func(a) {

        
    }

    @parameters({
        a: Function
    })
    [METHOD('func')](a) {
        
    }
}

class H extends T {

    //@allowNull
    @returnType(Number)
    @parameters({
        a: [Function, allowNull],
        b: Number,
    })
    func(a, e, b) {

        console.log('C', ...arguments)
    }

    //@overload('func')
    @parameters({
        param1: Function,
        param2: Boolean,
        param3: Number
    })
    [METHOD('func')](param1, param2, param3) {


    }

    // [METHOD('func')]() {


    // }
}

function dec(_, context) {

    const {name, metadata} = context;
    //console.log(name, metadata[ORIGIN] === metadata)
}

//module.exports = {A}

module.exports = {H, T} // {A, B, C, D, E, F, G, H};
