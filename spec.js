// const obj = {};

// console.log(obj.prototype.constructor);

const meta = {
    properties: {
        [prop]: {
            private: Boolean,
            static: Boolean,
            type: any,
            value: Function || any,

        }
    },
    prototype: meta
}

class A {

    constructor() {

        console.log('hello world');
    }
}

console.log(typeof A.prototype)