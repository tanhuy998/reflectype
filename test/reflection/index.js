const metadata = require('../../src/decorators/metadata.js');
const {METADATA} = require('../../src/constants.js');

@metadata()
class A {


}

@metadata()
class B {


}

const a = A[METADATA];
const b = B[METADATA];

console.log(a, b);