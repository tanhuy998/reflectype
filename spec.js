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

const path = require('node:path');
const { cwd } = require('node:process');
class A {

    #prop = 1;
    constructor() {

        console.log('hello world');
    }

    func() {

        return this.#prop;
    }
}


class B extends A {

}

initMetadata(A);
initPrototypeMetadata(A);

addPropertyMetadata(A, 'testStatic');
addPrototypePropertyMetadata(A, 'prop');

const a = new A()

const meta = new ReflectionClass(A);


const propMeta = new ReflectionProperty(A, 'prop');

console.log(propMeta.isValidReflection)

meta.attributes.forEach((prop) => {

    console.log(prop.isStatic);
});  


A.prototype.func.meta = {};

console.log(a.func);
