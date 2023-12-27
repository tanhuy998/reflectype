const {paramsType, returnType, type} = require('../../src/');
const {METADATA, TYPE_JS} = require('../../src/constants.js');
const allowNull = require('../../src/decorators/allowNull.js');
const defaultArguments = require('../../src/decorators/defaultArguments.js');
const { ORIGIN } = require('../../src/libs/metadata/constant.js');

const stack = [];
const entries = new Set();

class A {
    
    @type(Boolean)
    static prop;

    @paramsType(Boolean)
    static func() {


    }

    @type(Number)
    accessor prop;

    @allowNull
    @returnType(Number)
    @defaultArguments(1)
    @paramsType(Number)
    func() {

        console.log('func', ...arguments)
    }

    test() {

        this.func(...arguments);
    }
}

class B extends A {

    
    // @type(String)
    // accessor prop

    // @paramsType(String)
    @returnType(String)
    func() {

        console.log('B.func()')
    }
}

class C {

    //@allowNull
    @returnType(Number)
    @paramsType(Number)
    func() {

        console.log('C', ...arguments)
    }
}

function dec(_, context) {

    const {name, metadata} = context;

    console.log(name, metadata[ORIGIN] === metadata)
}


module.exports = {A, B, C};
