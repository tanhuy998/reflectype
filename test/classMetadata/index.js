// require('@babel/register')({
//     only: [
//         'class.js'
//     ]
// })

const {A, B} = require('./compiled.js');
const {METADATA} = require('../../src/constants.js');


console.log(B[METADATA]);