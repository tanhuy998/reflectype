// const obj = {};

// console.log(obj.prototype.constructor);

// ABSTRACT METADATA LAYOUT
// const meta = {
//       abstract:
//     properties: {
//         [prop]: {
//             private: boolean,
//             static: boolean,
//             type: any,
//             value: Array<VariableMetadata> || any, (when a propety is annotated as method, the "value" option here is detemined as the default parameter of the method)
//             isMethod: boolean,
//         }
//     },
//
//     interfaces: Set<Interface>
//     inheritance: {
//          properties: {
//              [prop]: {
//                  private: boolean,
//                  static: boolean,
//                  type: any,
//                  value: Array<VariableMetadata> || any, (when a propety is annotated as method, the "value" option here is detemined as the default parameter of the method)
//                  isMethod: boolean,
//              }
//          }
//     }
//     prototype: meta
// }

/**
 *  VARIABLE METADATA LAYOUT
 *  {
 *      type: any,
 *      value: any,
 *  }
 */



const initMetadata = require('./src/reflection/initMetadata.js');
const initPrototypeMetadata = require('./src/reflection/initPrototypeMetadata.js');
const addPropertyMetadata = require('./src/reflection/addPropertyMetadata.js');
const addPrototypePropertyMetadata = require('./src/reflection/addPrototypePropertyMetadata.js');
const getMetadata = require('./src/reflection/getMetadata.js');
const getPrototypeMetadata = require('./src/reflection/getPrototypeMetadata.js');

const ReflectionProperty = require('./src/metadata/reflectionProperty.js');

const ReflectionClass = require('./src/metadata/reflectionClass.js');

const isAbastract = require('./src/utils/isAbstract.js')

const {property_metadata_t, METADATA, TYPE_JS, metaOf} = require('./src/reflection/metadata.js');

const path = require('node:path');
const { cwd } = require('node:process');
const ReflectionPrototypeProperty = require('./src/metadata/reflectionPrototypeProperty.js');

const {type, allowNull, defaultArguments} = require('./src/decorators/');
const Interface = require('./src/interface/interface.js');
const implement = require('./src/decorators/implement.js');

const list = [];

function decorated(func, context) {

    const {access} = context;

    console.log(metaOf(func))

    return func;
}

function acc(prop, context) {

    const {get, set} = prop;

    console.log(get.meta)

    get.meta = 1;
    prop.init = function() {

        console.log(this)
    }

    return prop;
}

class ITest extends Interface {

    @defaultArguments(1,2,3)
    @allowNull
    @type(String)
    mustHave() {


    }
}

class ISecond extends Interface {

    @defaultArguments(1,2,3)
    @allowNull
    @type(String)
    mustHave() {


    }

    @defaultArguments(1,2,3)
    @allowNull
    @type(String)
    func() {


    }
}

console.log('start', ITest instanceof Interface)

@implement(ITest)
class A {
    
    // @type(String)
    // @allowNull
    static accessor testStatic;

    //static prop = list.push(this);
    testProp;

    //accessor getTest = 1;
    // @type(String)
    // @allowNull
    accessor test = 'abc';

    #prop = 1;
    constructor() {

        //console.log('hello world');
    }

    //@decorated
    func() {
        console.log(2)
        return this.#prop;
    }

    @defaultArguments(1,2,3)
    @allowNull
    @type(String)
    mustHave() {

    }

    //@decorated
    // @type(Boolean)
    //@allowNull
    //@defaultArguments(1,2,3)
    @type(String)
    testFunc(a = 3, b = 4) {
        
        console.log(arguments);

        return 'asdasd';
    }
}

// A.prototype.func[METADATA] = {};

// const funcMeta = new property_metadata_t();

// funcMeta.isMethod = true;


// A.prototype.func[METADATA][TYPE_JS] = funcMeta;

@implement(ITest, ISecond)
class B extends A {

    // static {

    //     console.log('B static block');
    // }

    @defaultArguments(1,2,3)
    @allowNull
    @type(A)
    func() {

        return new A();
    }
}

const objB = new B();

const temp = objB.func();

console.log(temp)

// initMetadata(A);
// initPrototypeMetadata(A);

// addPropertyMetadata(A, 'testStatic');
// //addPrototypePropertyMetadata(A, 'test');

// const temp = getMetadata(A);

// A.testStatic = null;

// console.log(A.testStatic)

// const a = new A()

// a.testFunc()//.then(value => console.log(value));

// console.log(a.test)

// //console.log(metaOf(A))

// const meta = new ReflectionClass(A);

// //const propMeta = new ReflectionProperty(a, 'func');

// //const static = new ReflectionProperty(A, 'testStatic')

// const newProp = new ReflectionPrototypeProperty(A, 'test');

// const prop = new ReflectionPrototypeProperty(A,'func');

// console.log('is valid', prop.isValid)


// console.log(a.getTest)
// meta.methods.forEach((prop) => {

//     console.log(prop.name, prop.isStatic);
// });