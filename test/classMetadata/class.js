const {paramsType, returnType, type} = require('../../src/');
const {METADATA, TYPE_JS} = require('../../src/constants.js');

const stack = [];
const entries = new Set();

class A {
    
    @type(Number)
    accessor prop;
}

class B extends A {

    
    @type(String)
    accessor prop
}

function dec(_, context) {
    console.log(1);
    const {metadata} = context;

    console.log(metadata[TYPE_JS]);

    return _;
}

function decorator(_, context) {

    const {metadata} = context;

    const your_custom_meta = metadata[your_props] = {}

    return _;
}


module.exports = {A, B};
