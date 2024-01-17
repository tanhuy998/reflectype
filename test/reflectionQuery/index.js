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

// const reflectMethod = new ReflectionPrototypeMethod(obj, 'func');

// const propMeta = new Reflection(A).mirror()
//                 .select('func')
//                 .where({
//                     isMethod: true
//                 })
//                 .from(ReflectionQuerySubject.PROTOTYPE)
//                 .on('properties')
//                 .retrieve();

class D {

    constructor(
        a = 1,
        b = 5
    ) {


    }
}

function test(a = 1, b = 2) {


}

console.log(extractClassConstructorInformations(test))

//obj.func();
// objB.prop = 1;
// objB.func(2);

// console.log(obj)c

// const refl = new ReflectionPrototypeMethodParameter(objB, 'func', 0);

console.log((new ReflectionClass(A)).metadata);
// console.log((new ReflectionClassPrototype(B)).isValid);

// console.log(D.toString();

// console.log(refl.type);

// console.log(refl.prototype.methods[0].isPrivate);