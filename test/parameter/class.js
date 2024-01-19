const allowNull = require('../../src/decorators/allowNull');
const defineParam = require('../../src/decorators/defineParam');
const parameters = require('../../src/decorators/parameters');
const paramsType = require('../../src/decorators/paramsType');
const type = require('../../src/decorators/type');
const {initMetadata} = require('../../src/libs/propertyDecorator');
const { metaOf } = require('../../src/reflection/metadata');
const { pseudo_parameter_decorator_context_t, generatePseudoParamDecoratorContext } = require('../../src/utils/pseudoDecorator');

function dec(_, context) {

    const pseudoContext =generatePseudoParamDecoratorContext(context);
    const propMeta = initMetadata(_, pseudoContext);

    console.log(propMeta)
}

class A {

    //@defineParam({index: 0, decorators: [type(Number), allowNull]})
    //@paramsType(String, Boolean, Number)
    @parameters({param2: String})
    func(param1, param2) {

        
    }
}

console.log(metaOf(A)._prototype.properties.func.functionMeta)