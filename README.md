# REFLECTYPE

Type support for javascript

## USAGE

### Type hint to class property

``` javascript
const {type, allowNull, returnType, defaultArgs, paramsType, Void} = require('reflectype');

class A {

    @type(Number)
    accessor id;

    constructor() {


    }

    @paramsType(Number, String)
    @defaultArgs(2, 'foe')
    @returnType(Void)
    print(id, name) {

        console.log(id, name);
    }
}


const obj = new A();

obj.id = 1;

obj.print(3, 'bar');
obj.print();

console.log(obj.id);

// would throw Error 
obj.id = '123';
obj.print('4', 'john');

```

### Implementing interfaces

``` javascript
const {Interface} = require('reflectype/interface');
const {implement} = require('reflectype');

class ILog extends Interface {

    log() {}
}

/**
 * would throw error because this class has not dedine log() method
 */
@implement(ILog)
class SomeClass {

    constructor() {


    }
}


```
