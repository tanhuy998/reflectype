# ReflecType

### Runtime type checking for Javascript.

### .babelrc setup

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

## Reflection API

Beside type checking, Reflectype provide Reflection API to help users understand about their classes.

## Property Reflection

### Reflect on static property
### Reflect on prototype property

