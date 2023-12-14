// require('@babel/register')({
//     only: [
//         'class.js'
//     ]
// })

const {A, B, ITestA, ITestB} = require('./compiled.js');
const {METADATA} = require('../../src/constants.js');
const { TYPE_JS } = require('../../src/reflection/metadata.js');
const matchType = require('../../src/libs/matchType.js');



console.log('A', A[METADATA][TYPE_JS].properties.prop)
console.log('B', B[METADATA][TYPE_JS].properties.prop);

const objA = new A();
const objB = new B();

//objA.prop = 'asd';
// objB.prop = '1';
// objA.prop = 1

// console.log(objA.func())
// console.log(objB.func('1'))

console.log(matchType(ITestA, objA))