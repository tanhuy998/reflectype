# ReflecType

### Runtime type checking for Javascript.

### Prerequisites

#### Babel version

To achieve accurate transpilatio, this package needs the latest version of Babel dependencies after version 7.23 because since version 7.23, Babel add implementation for TC-39 proposal decorator metadata.

This is configuration dependencies when developing this pacakage

```
{
    "devDependencies": {
        "@babel/core": "^7.23.5",
        "@babel/node": "^7.22.19",
        "@babel/plugin-proposal-decorators": "^7.23.5",
        "@babel/preset-env": "^7.23.5",
        "@babel/register": "^7.22.15",
        "@types/node": "^20.10.4",
        "babel-jest": "^29.7.0",
        "jest": "^29.7.0"
    }
}
```

#### .babelrc setup

```json
{
    "presets": [
        "@babel/preset-env"
    ],
    "plugins": [
        ["@babel/plugin-proposal-decorators", { "version": "2023-05" }]
    ]
}
```


## Usage

## Interface

Reflectype lets classes can implement Interface like other's strong typed language. To create an Interface, define a class that extends the `Interface` class which can be imported via two package's paths 'refletype/interface' and 'reflectype'.

The Interface class will prevent us from instantiating object on it's derived classes. 

### Implementing interfaces

``` javascript
const {Interface} = require('reflectype/interface');
const {implement} = require('reflectype');

class ILoggable extends Interface {

    /**
     * Declare methods that we wish a derived class must implement.
     * method body for an Interface class is useless
     */
    logConsole() {}
    logFile() {}
}

class IDisposable extends Interface {

    dispose() {}
}

/**
 * would throw error because this class has not been defined log() method
 */
@implement(ILoggable, IDisposable)
class SomeClass {

    logConsole(msg) {

    }

    logFile(msg) {

    }

    dispose() {

    }
}
```

## Class Attribute

A class's property is determined as an attribute when the keyword `accessor` is added before the property indentifier. `accessor` is not official Javascript's keyword, It's come with the TC-39 Proposal decorator for Javascript.

### Attribute type

`@type` decorator to define type check for an attribute. when setting value to an attribute, Reflectype will check if the type is 

``` javascript
const {type, allowNull, returnType, defaultArgs, paramsType, Void} = require('reflectype');

class A {

    @type(Number)
    accessor id;
}

const obj = new A;

obj.id = 'foo'; // error
obj.id = 1; // valid set
```
#### Type with interfaces

``` javascript
const {Interface} = require('reflectype/interface');
const {implement} = require('reflectype');
const {type} = require('reflectype');

class ILoggable extends Interface {

    /**
     * Declare methods that we wish a derived class must implement.
     * method body for an Interface class is useless
     */
    logConsole() {}
    logFile() {}
}

class IDisposable extends Interface {

    dispose() {}
}

/**
 * would throw error because this class has not been defined log() method
 */
@implement(ILoggable, IDisposable)
class SomeClass {

    logConsole(msg) {

    }

    logFile(msg) {

    }

    dispose() {

    }
}

class A {

    @type(ILoggable)
    accessor logger;
}

const obj = new A();
obj.logger = new SomeClass(); // no Error

```


### Attribute nullable

Use `@allowNull` to let the attribute can be setted as nullable (null or undefined)

``` javascript
const {type, allowNull, returnType, defaultArgs, paramsType, Void} = require('reflectype');

class A {

    @allowNull
    @type(Number)
    accessor id;
}
```

## Class Method

### Method return type

We can use either `@returnType` or `@type` to type check return value's type of a method. The different between the two decorator is @type can be applied on both class accessor properties and @returnType just only be applied to methods.

`Void` is a predefine class to help `@returnType` prevents method return anything (return nothing is similar to return undefined).

``` javascript
const {type, allowNull, returnType, defaultArgs, paramsType, Void} = require('reflectype');

class A {

    @returnType(Void)
    print(id, name) {

        console.log(id, name);

    }
}
```

### Method returns nullable

We can apply `@allowNull` on class's methods to allow the method return nullale (null or undefined) when the method has return type.

``` javascript
const {type, allowNull, returnType, defaultArgs, paramsType, Void} = require('reflectype');

class A {

    @allowNull
    @returnType(Void)
    print(id, name) {

        console.log(id, name);
    }
}
```
### Method paramerters type list

Use `@paramsType` to pass a list of method paramameters 's type.

```js
const {paramsType} = require('reflectype');

class Component {}

class A {

    @paramsType(Number, String, String)
    foo(param1, param2) {

        /**
         *  param1's type is [Number]
         *  param2's type is [String]
         *  arguments[2] 's type is [String]
         */
    }
}
```

### Explicit method parameters type

Since version 1.0.0 reflectype provide @parameters decorator to help method's parameter type hinting more explicitly. @parameters strictly read method's parameter list and then comparing. If we define parameter whose name didn't apear in the method definition, Error would be thrown.

```js
const {parameters} = require('reflectype');

class Component {}

class A {

    // valid
    @parameters({param1: Number, param2: String})
    foo(param1, param2) {

    }

    // valid 
    @parameters({b: Component})
    bar(a, b, c) {
        /** 
         * a's type is any
         * b's type is [Component]
         * c's type is any
         */
    }

    // invalid
    @parameters({param: Number})
    anotherMethod() {

    }
}
```

### We can add multiple metadata to parameter when using @parameters

```js
const {parameters, allowNull} = require('reflectype');

class Component {}

class A {

    // valid
    @parameters({
        param1: [Number, allowNull],
        param2: String
    })
    foo(param1, param2) {

    }
}
```

### Method default Arguments

### Default argument list

`@defaultArgumentList`

``` javascript
const {type, allowNull, returnType, defaultArgs, paramsType, Void} = require('reflectype');

class A {

    @defaultArgumentList(1, 'john', 'extra argument')
    print(id, name) {

        console.log(arguments);
    /**
     *  output similar to [1, 'john', 'extra argument']
     */
    }
}
```

### Explicit default arguments 

`@defaultArguments`

``` javascript
const {type, allowNull, returnType, defaultArgs, paramsType, Void} = require('reflectype');

class A {

    @defaultArguments({id: 1, name: 'john'})
    print(id, name) {

        
    }
}
```

## \[EXPERIMENTAL\] METHOD OVERLOADING (MULTIPLE DISPATCH) 

*Current development state:
- [x] Explicit type matched arguments
- [x] Interface type matched arguments
- [ ] Single dispatch (virtual method behavior across inheritance chain)
- [x] Polymorphism type matched arguments

New approaches:
- [ ] arguments caching
- [ ] static type corersion (pure method overloading)

### MULTIPLE DISPATCH CONCEPT

### ORIGIN AND PSEUDO METHOD

```js
class A {

    @returnType(Number)
    func() {
        /**
         * this is origin method
         */
    }

    @parameters({
        param1: String
    })
    [METHOD('func')](param1) {

        /**
         * this is pseudo method that is an overloaded version 
         * of the A.func() method that has 1 parameter accepts 
         * string type.
         */
    }
}
```

### OVERLOADING WITHOUT DECLARING PSEUDO METHOD

```js
class A {

    @returnType(Number)
    func() {
        /**
         * this is origin method
         */
    }

    @overload('func')
    @parameters({
        param1: String
    })
    anotherMethod(param1) {

        /**
         * this is pseudo method that is an overloaded version 
         * of the A.func() method that has 1 parameter accepts 
         * string type.
         */
    }
}
```

### METHOD OVERLOADING RESOLUTION

### PURE METHOD OVERLOADING (STATIC TYPE COERSION)

### METHOD SIGNATURE

