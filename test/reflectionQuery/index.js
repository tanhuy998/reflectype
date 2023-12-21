// require('@babel/register')({
//     only: [
//         'class.js'
//     ]
// })

const {A, B, C} = require('./compiled.js');
const {METADATA} = require('../../src/constants.js');
const { TYPE_JS } = require('../../src/reflection/metadata.js');

const Reflector = require('../../src/metadata/reflector.js');
const ReflectionAspect = require('../../src/metadata/reflectionAspect.js');
const ReflectionQuerySubject = require('../../src/metadata/query/reflectionQuerySubject.js');

const refl = new Reflector(A);
const reflAspect = new ReflectionAspect(refl);

const obj = reflAspect.query()
                        .select('func')
                        .from(ReflectionQuerySubject.PROTOTYPE)
                        .retrieve();

console.log(obj)

new A();

console.log(obj)