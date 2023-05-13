const {implement, Interface, type, hintable, countFunctionParams} = require('./index.js');

class ITest extends Interface{

    func() {};
}

@hintable
class IProp extends Interface {

    getProp() {};
}

@hintable
@implement(IProp)
class AnotherClass {

    getProp() {

    };
}

@hintable
@implement(IProp)
class E {

    a = 'hello world'

    getProp() {

    }
}

@implement(ITest)
class A extends AnotherClass{

    @IProp accessor prop;

    constructor() {

        super();
    }


    @AnotherClass func() {

        console.log(this.prop);

        return new AnotherClass();
    }
}


const obj = new A();

//console.log(obj.__is(A))

console.log(ITest.__proto__);

console.log(IProp)

console.log('init', (new E()).__is(IProp));

obj.prop = new E();

obj.func();

//console.log(obj.prop);






