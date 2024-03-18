const parameters = require("../../src/decorators/parameters");
const { METHOD } = require("../../src/libs/methodOverloading/constant");

class A {

    @parameters({
        a: Boolean
    })
    func(a) {

        console.log("boolean");
    }

    // @parameters({
    //     a: String
    // })
    // [METHOD('func')](a) {

    //     console.log("string");
    // }
}

const o = new A();

o.func(1);