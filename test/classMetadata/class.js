const {paramsType, returnType, type} = require('../../src/');

class A {
    
    //@dec
    @type(Number)
    accessor prop
}

class B extends A {

    //@dec
    @type(String)
    accessor prop

}

function dec(_, context) {

    const {metadata} = context;
    console.log(['dec'], metadata)
    metadata.prop = Date.now();

    return _;
}


module.exports = {A, B};
