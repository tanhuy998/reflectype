// const obj = {};

// console.log(obj.prototype.constructor);

// ABSTRACT METADATA LAYOUT
// const meta = {
//       abstract:
//     properties: {
//         [prop]: {
//             private: boolean,
//             static: boolean,
//             type: any,
//             value: Array<VariableMetadata> || any, (when a propety is annotated as method, the "value" option here is detemined as the default parameter of the method)
//             isMethod: boolean,
//         }
//     },
//
//     interfaces: Set<Interface>
//     inheritance: {
//          properties: {
//              [prop]: {
//                  private: boolean,
//                  static: boolean,
//                  type: any,
//                  value: Array<VariableMetadata> || any, (when a propety is annotated as method, the "value" option here is detemined as the default parameter of the method)
//                  isMethod: boolean,
//              }
//          }
//     }
//     prototype: meta
// }

/**
 *  VARIABLE METADATA LAYOUT
 *  {
 *      type: any,
 *      value: any,
 *  }
 */

// const {type, allowNull, returnType, implement} = require('./src/decorators');
// const defaultArguments = require('./src/decorators/defaultArguments');
// const paramsType = require('./src/decorators/paramsType');
// const Void = require('./src/type/void');
// const {ReflectionPrototypeMethod} = require('./src/metadata');
// const ReflectionParameter = require('./src/metadata/ReflectionParameter');
// const ReflectionFunction = require('./src/metadata/reflectionFunction');
// const {Interface} = require('./src/interface');



// class ILog extends Interface {

//     log() {}
// }

// // The code defines a class A with a property and a method. The method is asynchronous and logs the arguments passed to it before returning a value of 1.
// @implement(ILog)
// class A {

//     @type(String)
//     accessor prop;

//     //@paramsType(String)
//     // @defaultArguments('a', 3, 2)
//     @allowNull
//     @returnType(Void)
//     async func() {

//         //throw new Error();

//         console.log(arguments);

//         return 1;
//     }
// }

// const meta = new ReflectionPrototypeMethod(A, 'func');

// const obj = new A();

// const method = obj.func;

// const paramMeta = new ReflectionParameter(method, 1);

// const funcMeta = new ReflectionFunction(method);

// for (const param of funcMeta.parameters) {

//     console.log(param.type);
// }

// async function func() {
    
//     try {

//         const ret = await obj.func('', 3, 4);

//         console.log(ret)
//     }
//     catch {

//         console.log(4)
//     }
// }

// func();


