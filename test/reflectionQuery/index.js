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
const ReflectionPrototypeProperty = require('../../src/metadata/prototypeReflection/reflectionPrototypeProperty.js');
const ReflectionPrototypeMethod = require('../../src/metadata/prototypeReflection/reflectionPrototypeMethod.js');
const ReflectionPrototypeAttribute = require('../../src/metadata/prototypeReflection/reflectionPrototypeAttribute.js');
const ReflectionClassPrototype = require('../../src/metadata/prototypeReflection/reflectionClassPrototype.js');
const ReflectionPrototypeParameter = require('../../src/metadata/parameter/reflectionPrototypeMethodParameter.js');
const ReflectionClassMethodParameter = require('../../src/metadata/parameter/reflectionClassMethodParameter.js');
const ReflectionStaticMethod = require('../../src/metadata/staticReflection/reflectionStaticMethod.js');

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

const refl = new ReflectionStaticMethod(obj, 'func');

console.log(refl.parameters[0].type);