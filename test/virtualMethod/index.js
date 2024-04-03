const { paramameters, Interface, Void } = require("../../src");
const implement = require("../../src/decorators/implement");
const override = require("../../src/decorators/override");
const returnType = require("../../src/decorators/returnType");
const type = require("../../src/decorators/type");
const virtual = require("../../src/decorators/virtual");
const { METHOD } = require("../../src/libs/methodOverloading/constant");

class IFoo extends Interface {

    @paramameters({
        a: String
    })
    func(a) {


    }
}

class IBar extends IFoo {

    @returnType(Void)
    bar() {

    }
}

@implement(IFoo)
class A {

    @virtual
    @paramameters({
        a: String
    })
    func(a) {

        //console.log('A string');
    }
}

@implement(IBar)
class B extends A { 

    @paramameters({
        a: Number
    })
    func(a) {

        //console.log('B number');
    }

    //@override
    @paramameters({
        a: String
    })
    [METHOD('func')](a) {

        //console.log('B string');
    }

    @returnType(Void)
    bar() {

    }
}

@implement(IFoo)
class C extends B {

    //@override
    @paramameters({
        a: String
    })
    func(a) {

        //console.log('C string');
    }
}

class Test {

    @type(A)
    accessor obj;

    constructor() {

        this.obj = new C();
    }
}

const obj = (new Test()).obj;

obj.func('');

const start = process.hrtime.bigint();
for (let i =0; i < 100000; ++i) {

    obj.func('');
}
const end = process.hrtime.bigint();
console.log('total time', end - start);

console.log(obj instanceof IFoo)