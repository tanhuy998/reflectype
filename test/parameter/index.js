const { metaOf } = require('../../src/reflection/metadata')
const {A} = require('./compiled')

console.log(metaOf(A)._prototype.properties.func.functionMeta);

const obj = new A();

obj.prop = 'asd';
obj.prop = undefined;
obj.func();