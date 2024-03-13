const {paramsType, returnType, type, Interface} = require('../../src/');
const {METADATA, TYPE_JS} = require('../../src/constants.js');
const allowNull = require('../../src/decorators/allowNull.js');
const defaultArguments = require('../../src/decorators/defaultArguments.js');
const parameters = require('../../src/decorators/parameters.js');
const overload = require('../../src/decorators/overload.js');
const { ORIGIN } = require('../../src/libs/metadata/constant.js');
const { METHOD } = require('../../src/libs/methodOverloading/constant.js');
const Any = require('../../src/type/any.js');
const implement = require('../../src/decorators/implement.js');
const virtual = require('../../src/decorators/virtual.js');

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

class IDisposable extends Interface {

    func() {}
}

class IFoo extends IDisposable {

    foo() {}
}

@implement(IDisposable)
class A {

    func() {}
}

class B extends A {


}

@implement(IFoo)
class Y {

    func() {}
    foo() {}
}

class T {

    @parameters({
        a: Number
    })
    func(a) {
        console.log('origin')
    }

    // @parameters({
    //     a: String,
    //     b: B
    // })
    // [METHOD('func')](a, b) {
    //     console.log('string')
    // }

    // @parameters({
    //     a: String,
    //     b: B,
    //     c: IDisposable
    // })
    // [METHOD('func')](a, b, c) {
    //     console.log('0')
    // }

    // @parameters({
    //     a: String,
    //     b: Number
    // })
    // [METHOD('func')](a, b) {

    //     console.log('number')
    // }

    @virtual
    @parameters({
        a: String,
        b: Number,
        c: Boolean
    })
    [METHOD('func')](a, b, c) {

        console.log('T base')
    }


    @parameters({
        a: String,
        b: Number,
        c: Number
    })
    [METHOD('func')](a, b, c) {


    }

    @parameters({
        param: B
    })
    [METHOD('func')](param) {

        console.log('B')
    }

    @parameters({
        a: A
    })
    [METHOD('func')](a) {

        console.log('T dispose')
    }

    @virtual
    @parameters({
        a: Number
    })
    static stFunc(a) {

        console.log("static T");
    }

    @parameters({
        a: String
    })
    static [METHOD('stFunc')](a) {

        console.log('another static T');
    }
}

class H extends T {

    @type(IDisposable)
    accessor prop;

    @parameters({
        a: String,
        b: Number,
    })
    static stFunc(a, b) {

        console.log("static H");
    }

    @parameters({
        a: Number 
    })
    static [METHOD('stFunc')](a) {

        console.log('another static H')
    }

    @parameters({
        a: [String, allowNull],
        b: Number,
        c: Boolean
    })
    func(a, b, c) {

        console.log('H override');
    }

    @parameters({
        a: Number,
        b: [String, allowNull],
        c: String,
    })
    [METHOD('func')](a, b, c) {

        console.log('test nullable')
    }

    //@overload('func')
    @parameters({
        param1: String,
        param2: Boolean,
        param3: Number
    })
    [METHOD('func')](param1, param2, param3) {

        console.log('string bool num')
    }

    @parameters({
        param1: IDisposable,
    })
    [METHOD('func')](param1) {

        console.log('dispose')
    }

    @parameters({
        param1: A,
        b: IDisposable,
        c: Number
    })
    [METHOD('func')](param1, b, c) {

        console.log('7');

    }
}

class C extends H {

    @parameters({
        a: [String, allowNull],
        b: Number,
        c: Boolean
    })
    func(a, b, c) {

        console.log('C override');
    }

    @parameters({
        a: [Number],
        b: Number,
        c: Boolean
    })
    [METHOD('func')](a, b, c) {

        console.log('n n b')
    }

    @parameters({
        param1: IDisposable,
        b: IDisposable,
        c: Number
    })
    [METHOD('func')](param1, b, c) {

        console.log('8');
    }
}

function dec(_, context) {

    const {name, metadata} = context;
    //console.log(name, metadata[ORIGIN] === metadata)
}

//module.exports = {A}

module.exports = {H, T, A, B, C, Z, Y} // {A, B, C, D, E, F, G, H};
