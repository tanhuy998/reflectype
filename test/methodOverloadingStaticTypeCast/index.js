const { Interface } = require("../../src");
const implement = require("../../src/decorators/implement");
const parameters = require("../../src/decorators/parameters");
const type = require("../../src/decorators/type");
const { METHOD } = require("../../src/libs/methodOverloading/constant");

class IFoo extends Interface {

    foo() {}
}

@implement(IFoo)
class A {

    foo() {}
}

class B extends A {}

class T {

    @type(A)
    accessor prop;
}

class Test {

    @parameters({
       param: A
    })
    func(param) {

        console.log('overloaded for A');
    }

    @parameters({
        param1: B,
    })
    [METHOD('func')](param1) {

        console.log('overloaded for B');   
    }
}


const T_obj = new T();
T_obj.prop = new B();

const test_method_overload_obj = new Test();

test_method_overload_obj.func(T_obj.prop);
test_method_overload_obj.func(new B());
