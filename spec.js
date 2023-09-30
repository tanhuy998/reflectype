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

const list = [];

class A {

    static {

        console.log('A static block');

        //list.push(this);
    }

    static testStatic;

    //static prop = list.push(this);

    #prop = 1;
    constructor() {

        console.log('hello world');
    }

    func() {

        return this.#prop;
    }
}

A.prototype.func[METADATA] = {};
A.prototype.func[METADATA][TYPE_JS] = new property_metadata_t();

class B extends A {

    // static {

    //     console.log('B static block');
    // }
}
// initMetadata(A);
// initPrototypeMetadata(A);

addPropertyMetadata(A, 'testStatic');
// addPrototypePropertyMetadata(A, 'func');

const temp = getMetadata(A);

console.log(temp)

const a = new A()

const meta = new ReflectionClass(A);

const propMeta = new ReflectionProperty(a, 'func');

//const static = new ReflectionProperty(A, 'testStatic')

console.log('is valid', propMeta.isValid)

// meta.attributes.forEach((prop) => {

//     console.log(prop.isStatic);
// });  
