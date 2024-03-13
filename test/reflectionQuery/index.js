// require('@babel/register')({
//     only: [
//         'class.js'
//     ]
// })

const {A, B, C, D, E, F, G, H, T, Z, Y} = require('./compiled.js');
const {METADATA} = require('../../src/constants.js');
const { TYPE_JS, property_metadata_t, metaOf } = require('../../src/reflection/metadata.js');

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
const Void = require('../../src/type/void.js');
const { extractFunctionInformations, extractClassConstructorInformations } = require('../../src/utils/function.util.js');
const { FOOTPRINT, TYPE } = require('../../src/libs/constant.js');
const { isTypeOf } = require('../../src/metadata/aspect/criteriaOperator.js');
const { searchForMethodVariant } = require('../../src/libs/methodOverloading/methodVariantResolution.lib.js');
const { getAllParametersMeta } = require('../../src/libs/functionParam.lib.js');
const { retrieveAllSignatures, findMethodVariantOf } = require('../../src/libs/methodOverloading/methodVariantTrieOperation.lib.js');

const {diveTrieByArguments} = require('../../src/libs/methodOverloading/methodVariant.lib.js')

const {METHOD} = require('../../src/libs/methodOverloading/constant.js');
const { Any } = require('../../src/index.js');
const { isPrimitive, getTypeOf } = require('../../src/libs/type.js');

const v8 = require('node:v8');
const { getCastedTypeOf, dynamic_cast, static_cast } = require('../../src/libs/casting.lib.js');
const {FUNC_TRIE} = require('../../src/libs/metadata/registry/function.reg.js')
// const {A} = require('./compiled.js');
//console.log(METHOD)
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

// const obj = new A();
// const objB = new B()
// const objC = new C();
//const objD = new D();


//console.log(meta)

// new ReflectionClassPrototype(B);

//const ref = new ReflectionClassMethodParameter(obj, '#func', 1);
//const ref = new ReflectionPrototypeMethod(C, 'func');
//const ref = new ReflectionPrototypeMethod(E, 'func')


// class M extends A {


// }

// class N extends M {


// }

// Object.defineProperty(M, METADATA, {
//     value: Object.setPrototypeOf({}, A[METADATA])
// })

// const wrapperA = A[METADATA]
// const wrapperM = M[METADATA]

// console.log(wrapperM === wrapperA)
// console.log(N[METADATA] === wrapperM)
// console.log(N[METADATA] === wrapperA)

console.log(getTypeOf(true))
console.log()


//console.log(A)
const ref = new ReflectionClassPrototype(H);
const mRef = new ReflectionPrototypeMethod(H, 'func');

const funcMeta = ref.metadata.functionMeta;


const o = new T();
const obj = new H();
const c = new C();


console.log(metaOf(T).methodVariantMaps.static.statisticTable)
console.log(metaOf(T).methodVariantMaps._prototype.statisticTable)
console.log(metaOf(H).methodVariantMaps.static.statisticTable)
console.log(metaOf(H).methodVariantMaps._prototype.statisticTable)
console.log(metaOf(C).methodVariantMaps.static.statisticTable)
console.log(metaOf(C).methodVariantMaps._prototype.statisticTable)

obj.prop = new A();

console.log(getCastedTypeOf(dynamic_cast(obj.prop)))
console.log()
// console.log(
//     diveTrieByArguments(H, mRef.metadata, ['1'])?.map.get(ref.metadata)
// )

console.log(['all method variant'], retrieveAllSignatures(FUNC_TRIE));

console.log(['000000000000000000000000000000000000000000000000000000'])

const args = [dynamic_cast(obj.prop), new A(), 1];
console.time(2)

// H.stFunc(1)
// T.stFunc(1)

// for (const [key, value] of diveTrieByArguments(H, mRef.metadata, args)?.map.entries() || [[]]) {

//     console.log(value.call(new H(), ...args));
// }
//const mRef = new ReflectionPrototypeMethod(T, 'func');
//console.log(findMethodVariantOf(T, mRef.metadata, [Number]))
// console.log(mRef.metadata.owner.typeMeta.abstract)
// console.log(mRef.metadata.owner.typeMeta.methodVariantMaps._prototype.get('func').current)

//console.log(searchForMethodVariant(funcMeta, [Function, Number]))

class Temp {

    func() {

        //console.log()
    }
}

const t = new Temp();

o.func('1', 1, true)
obj.func('1', 1, true)
c.func(null, 1, true);
//c.func(new A(), new A(), 1)
console.timeEnd(2)

console.time('total1')

//c.func(new A(), new A(), 1)

for (let i = 0; i < 0; ++i) {

    //console.time(2)

    //obj.func(...args);
    obj.func(new A(), new A(), 1)

    //console.timeEnd(2)
}
console.timeEnd('total1')

console.time('total2')
for (let i = 0; i < 1000; ++i) {

    //console.time(2)

    t.func(...args);

    //console.timeEnd(2)
}
console.timeEnd('total2')

// const typeMeta = ref.metadata.owner.typeMeta;
// const trieMaps = typeMeta.methodVariantMaps;
// const prototypeMap = trieMaps._prototype;
// const trie = prototypeMap.mappingTable.get('func');

// //console.log(ref.metadata.properties.func)
// console.log(['statistic table'], prototypeMap.statisticTable)

//console.log(v8.getHeapStatistics());
console.log(process.memoryUsage())




// for (let i = 0; i < 1000; ++i) {
// // // console.time(2)
// // // const ref = new ReflectionPrototypeAttribute(obj, 'prop');
// // // console.timeEnd(2)

// // console.time(2)
// // //console.log(A)
// // const ref = new ReflectionClassPrototype(T);

// // const funcMeta = ref.metadata.functionMeta;
// // //console.log(ref.metadata.owner.typeMeta);
// // //console.log(searchForMethodVariant(funcMeta, [Function, Number]))
// // console.timeEnd(2)

// console.time(2)

// diveTrieByArguments(H, mRef.metadata, ['1'])?.map.get(ref.metadata)

// console.timeEnd(2)
// }


//obj.prop = 1;
// console.log(metaOf(E));
// console.log(metaOf(A))
//ref.setValue(2);
//const objA = new A();
//console.log(Reflect.ownKeys(E.prototype));

// const ref2 = new ReflectionClass(D);
// console.log(ref2.metadata)

// for (const p of ref.parameters || []) {

//     console.log(p.isValidReflection);
//     const meta = p.mirror().select('#func')
//     .on('properties')
//     .from(ReflectionQuerySubject.STATIC)
//     .where({
//         isMethod: true
//     })
//     .first()
//     .retrieve()

//     console.log(meta)
// }


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