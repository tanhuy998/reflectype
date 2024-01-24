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
const ReflectionPrototypeMethodParameter = require('../../src/metadata/parameter/reflectionPrototypeMethodParameter.js');
const { type } = require('os');
const Void = require('../../src/type/void.js');
const { extractFunctionInformations, extractClassConstructorInformations } = require('../../src/utils/function.util.js');
const { FOOTPRINT, TYPE } = require('../../src/libs/constant.js');
const { isTypeOf } = require('../../src/metadata/aspect/criteriaOperator.js');
// const {A} = require('./compiled.js');


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
const objB = new B()
const objC = new C();


const ref = new ReflectionPrototypeMethod(objB, 'func');
console.log(ref.metadata)


// const reflectMethod = new ReflectionPrototypeMethod(obj, 'func');

// const propMeta = new Reflection(A).mirror()
//                 .select('func')
//                 .where({
//                     isMethod: true
//                 })
//                 .from(ReflectionQuerySubject.PROTOTYPE)
//                 .on('properties')
//                 .retrieve()

// obj.func();
// obj.prop = 'asdc'
// objB.prop = 1;
// c

// console.log(obj)c
//console.time(1)
// const refl = new ReflectionPrototypeMethodParameter(objC, 'func', 'a');
// const refl = new ReflectionClassPrototype(objB);

// console.timeEnd(1)
// console.time(1)
// const meta = refl.mirror({deepCriteria: true})
//                 //.select('func')
//                 .from(ReflectionQuerySubject.PROTOTYPE)
//                 .on('properties')
//                 .where({
//                     // [FOOTPRINT]: {
//                     //     //isDecorated: true
//                     //     paramDecorated: true
//                     // },
//                     type: isTypeOf(String)
//                 })
//                 .prolarize('type', 'name')
//                 .retrieve();
// console.timeEnd(1)
// console.log(meta)

// console.log((new ReflectionClass(A)).metadata);
// console.log((new ReflectionClassPrototype(B)c).isValid);

// console.log(D.toString();

// console.log(refl.parameters);
// console.time(1)
// for (let i = 0; i < 1000; ++i) {
//     console.time(2)
//     new ReflectionPrototypeMethod(objB, 'func').parameters;
//     new ReflectionPrototypeMethod(objB, 'func').parameters;
//     new ReflectionPrototypeMethod(objB, 'func').parameters;
//     console.timeEnd(2)
// }
// console.timeEnd(1)