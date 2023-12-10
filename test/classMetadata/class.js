const {paramsType, returnType, type} = require('../../src/');

class A {
    
    //@type(Number)
    accessor prop
}

class B extends A {

    //@type(String)
    @dec
    accessor prop
}

function dec(_, context) {

    return _;
}


module.exports = {A, B};
