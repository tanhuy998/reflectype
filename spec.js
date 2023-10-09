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

const {type, allowNull} = require('./src/decorators');
const defaultArguments = require('./src/decorators/defaultArguments');

class A {

    @type(String)
    accessor prop;

    @defaultArguments(1, 3, 2)
    @allowNull
    @type(Boolean)
    func() {

        console.log(arguments);

        return 
    }
}

const obj = new A();

obj.func();

obj.prop = 1;
