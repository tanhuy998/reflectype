const {initMetadata} = require('../../src/libs/propertyDecorator');
const { pseudo_parameter_decorator_context_t, generatePseudoParamDecoratorContext } = require('../../src/utils/pseudoDecorator');

function dec(_, context) {

    const pseudoContext =generatePseudoParamDecoratorContext(context);
    const propMeta = initMetadata(_, pseudoContext);

    console.log(propMeta)
}

class A {

    @dec
    func() {


    }
}