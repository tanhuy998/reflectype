const {paramsType, returnType, type} = require('../../src/');

class A {
    
    @type(Number)
    accessor prop
}

class B extends A {

    @type(String)
    accessor prop
}


module.exports = {A, B};
