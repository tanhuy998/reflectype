// require('@babel/register')({
//     only: [
//         'class.js'
//     ]
// })

const {A, B} = require('./compiled.js');
const {METADATA} = require('../../src/constants.js');



console.log('A', A[METADATA])
console.log('B', B[METADATA]);

const objA = new A();
const objB = new B();

//objA.prop = 'asd';
objB.prop = 1;