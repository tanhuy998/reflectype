// require('@babel/register')({
//     only: [
//         'class.js'
//     ]
// })

const {A, B} = require('./compiled.js');
const {METADATA} = require('../../src/constants.js');
const { TYPE_JS } = require('../../src/reflection/metadata.js');
const Reflector = require('../../src/metadata/reflector.js');
const ProtoReflection = require('../../src/metadata/reflectionPrototypeMethod.js');

const reflection = new ProtoReflection(B, 'func');

console.log(reflection.type)

const objA = new A();
const objB = new B();


// console.log(objA.func())
// console.log(objB.func('1'))