// require('@babel/register')({
//     only: [
//         'class.js'
//     ]
// })

const {A, B, C} = require('./compiled.js');
const {METADATA} = require('../../src/constants.js');
const { TYPE_JS, property_metadata_t } = require('../../src/reflection/metadata.js');

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
const ReflectionStaticAttribute = require('../../src/metadata/staticReflection/reflectionStaticAttribute.js');
const ReflectionClass = require('../../src/metadata/staticReflection/reflectionClass.js');
const Reflection = require('../../src/metadata/reflection.js');

const {getDecoratedValue} = require('../../src/libs/propertyDecorator.js');

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
const a = 'initial 2 object';
const b = 'reflection time';
// console.log(obj)
console.time(a);
const obj = new A();
const objB = new B()
console.timeEnd(a);
// const reflectMethod = new ReflectionPrototypeMethod(obj, 'func');

// const propMeta = new Reflection(B).mirror()
//                 .select('func')
//                 // .where({
//                 //     isMethod: true
//                 // })
//                 .from(ReflectionQuerySubject.PROTOTYPE)
//                 // .on('properties')
//                 .retrieve();

// console.log(propMeta)

// // objB.func();
// // objB.func();

// // console.log(obj)
console.time(b);
const refl = new ReflectionPrototypeProperty(objB, 'func');
console.timeEnd(b)

console.time(b)
for (let i = 0; i < 10_000_000; ++i) {
    new ReflectionPrototypeAttribute(objB, 'func');
}
console.timeEnd(b)



console.log(refl.metadata.owner)
console.log(refl.type);

// console.log(refl.prototype.methods[0].isPrivate);