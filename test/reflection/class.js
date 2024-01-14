const {paramsType, returnType, type} = require('../../src/');
const {METADATA, TYPE_JS} = require('../../src/constants.js');
const allowNull = require('../../src/decorators/allowNull.js');
const { ORIGIN } = require('../../src/libs/metadata/constant.js');

const stack = [];
const entries = new Set();

class A {
    
    @type(Number)
    accessor prop;

    @dec
    @allowNull
    @returnType(Number)
    @paramsType(Number)
    func() {

        console.log('func', ...arguments)
    }

    constructor() {

        console.log('A constructor')
    }


    test() {

        this.func(...arguments);
    }
}

class B extends A {

    accessor prop

    constructor() {

        super();
        console.log('B construct')
    }

    @dec
    func() {


    }
}

function dec(_, context) {

    const {name, metadata, addInitializer} = context;

    addInitializer(function() {

        console.log('dec init')
    })

    return _
}


module.exports = {A, B};
