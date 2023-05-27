const {implement, Interface, type, hintable, countFunctionParams, INTERFACES} = require('./index.js');
const {REFLECTION} = require('./constant.js')

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
    //@E
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



console.log(obj.prop.type)

// const rand = new E()

// console.log('init', rand.__is(IProp));

// obj.prop = new E();
// //console.log(obj.prop.__is(E))

// obj.func();

// console.log(E[INTERFACES])

//console.log(obj.prop);


