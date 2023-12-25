// require('@babel/register')({
//     only: [
//         'class.js'
//     ]
// })

const {A, B, C} = require('./compiled.js');
const {METADATA} = require('../../src/constants.js');
const { TYPE_JS } = require('../../src/reflection/metadata.js');

const Reflector = require('../../src/metadata/reflector.js');
const ReflectionAspect = require('../../src/metadata/aspect/reflectionAspect.js');
const ReflectionQuerySubject = require('../../src/metadata/query/reflectionQuerySubject.js');
const TypeMetadataReflection = require('../../src/metadata/typeMetaReflection.js');
const ReflectionPrototypeProperty = require('../../src/metadata/reflectionPrototypeProperty.js');
const ReflectionPrototypeMethod = require('../../src/metadata/reflectionPrototypeMethod.js');
const ReflectionPrototypeAttribute = require('../../src/metadata/reflectionPrototypeAttribute.js');

// const refl = new Reflector(A);
// const reflAspect = new ReflectionAspect(refl);

// const obj = reflAspect.query()
//                         //.select('func')
//                         .where({
//                             isMethod: false
//                         })
//                         .from(ReflectionQuerySubject.PROTOTYPE)
//                         .on('properties')
//                         .retrieve();

// console.log(obj);

// console.log(obj)

const obj = new A();

console.log(obj)

const refl = new ReflectionPrototypeAttribute(obj, 'prop');

console.log(refl.isValid)