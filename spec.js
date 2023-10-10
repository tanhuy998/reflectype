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

const {type, allowNull, returnType} = require('./src/decorators');
const defaultArguments = require('./src/decorators/defaultArguments');
const paramsType = require('./src/decorators/paramsType');
const Void = require('./src/type/void');

class A {

    @type(String)
    accessor prop;

    @paramsType(String)
    // @defaultArguments('a', 3, 2)
    @allowNull
    @returnType(Void)
    func() {

        //throw new Error();

        console.log(arguments);

        return 1;
    }
}


const obj = new A();

obj.func('');

// async function func() {
    
//     try {

//         obj.func(2, 3, 4);
//     }
//     catch {


//     }
// }


