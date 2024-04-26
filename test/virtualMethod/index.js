const { isProxy } = require("util/types");
const { paramameters, Interface, Void } = require("../../src");
const implement = require("../../src/decorators/implement");
const override = require("../../src/decorators/override");
const returnType = require("../../src/decorators/returnType");
const type = require("../../src/decorators/type");
const virtual = require("../../src/decorators/virtual");
const { METHOD } = require("../../src/libs/methodOverloading/constant");
const { getVPtrOf } = require("../../src/libs/typeEnforcement.lib");
const final = require("../../src/decorators/final");

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

    @returnType(Void)
    #another() {

        console.log(1)
    }

    @paramameters({
        a: Number
    })
    [METHOD('#another')](a) {

        console.log('private number');
    }

    @virtual
    @paramameters({
        a: String
    })
    func(a) {
        console.log(this, this instanceof A, isProxy(this))
        this.#another(1)
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

    //@final
    @override
    @paramameters({
        a: String
    })
    [METHOD('func')](a) {

        //super.func('')
        console.log('B string');
    }

    @returnType(Void)
    bar() {

    }
}

@implement(IFoo)
class C extends B {

    @final
    @override
    @paramameters({
        a: String
    })
    func(a) {

        //super.func('')
        console.log('C string');
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
console.time(2);
for (let i =0; i < 0; ++i) {

    obj.func('');
}
console.timeEnd(2);
const end = process.hrtime.bigint();
console.log('total time', end - start);

console.log(obj instanceof IFoo)


