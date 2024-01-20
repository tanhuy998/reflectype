const { Console } = require('console');
const {paramsType, returnType, type} = require('../../src/');
const {METADATA, TYPE_JS} = require('../../src/constants.js');
const allowNull = require('../../src/decorators/allowNull.js');
const defaultArguments = require('../../src/decorators/defaultArguments.js');
const parameters = require('../../src/decorators/parameters.js');
const { ORIGIN } = require('../../src/libs/metadata/constant.js');

const stack = [];
const entries = new Set();



class A {
    
    @type(Boolean)
    static accessor prop;

    @paramsType(Boolean)
    static #func() {


    }
    
    constructor(param1, param2) {


    }

    @type(Number)
    accessor prop;

    @type(String)
    accessor strProp;

    @allowNull
    @returnType(Number)
    //@defaultArguments(1)
    @paramsType(Number)
    func(a, b, ...c) {

        console.log('func', ...arguments)
    }

    @dec
    test() {

        this.func(...arguments);
    }
}

class B extends A {

    
    @type(String)
    accessor prop

    @allowNull
    @paramsType(String, Number)
    @returnType(String)
    func(param1, param2) {

        console.log('B.func()', arguments)
    }
}

class C {

    //@allowNull
    @returnType(Number)
    @parameters({ b: Number, a: Function})
    func(a, b) {

        console.log('C', ...arguments)
    }
}

function dec(_, context) {

    const {name, metadata} = context;
    //console.log(name, metadata[ORIGIN] === metadata)
}

//module.exports = {A}

module.exports = {A, B, C};
