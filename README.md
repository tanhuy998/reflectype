# ReflecType

### Runtime type checking for Javascript.

## Features

- Runtime type check
- Interface
- Method overloading

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

## Method Overloading (Multiple Dispatch) 

Reflectype provides the ability to oeverloading methods like other object oriented languages (C++, C#, Java). The concept and keywords inspired mostly from C# language.

### Usage

### Origin and Pseudo Method

```js
const {METHOD, returnType, parameters} = require('reflectype');

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

### Overloading Without Declaring Pseudo Method

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

Maxium number of type hinted parameter for each method is 32 because part of the overall algorithm for method overloading designed in this package is heuristic approach, the decision for choosing the best match method signature for a particular argument list depends mostly on the statistic table that uses numbers (32 bit) to store indexes of a specific type which is potentially been declared.

### Pure Method Overloading (Static Type Binding)

Cosider the following example written in C# 

```C#
using System;


public class A {

    public virtual void foo() {

        Console.WriteLine('A');
    }
}

public class B: A {

    public override void foo() {

        Console.WriteLine('B');
    }
}

public class Test {


    public static void func(A o) {

        Console.WriteLine("overloaded for A");
    }

    public static void func(B o) {

        Console.WriteLine("overloaded for B");
    }

    public static void Main() {

        A obj = new B();

        Test.func(obj);
        Test.func(new B());

    // result in terminal will be
    //
    // overloaded for A
    // overloaded for B
    }
}
```
The two invocations of static method Test.func() print different result in the terminal because of the first ivocation 

```C#
A obj = new B();

Test.func(obj);
```
The type of variable `obj` is determined at compile time is `A` no matter what the exact object is passed to the variable is an a polymorphic type of `A` and lead to the result that the method variant has signature `func(A o)` is the best candidate to be dispatched. This case is called _**Method Overloading**_.

Look at the second invocation

```C#
Test.func(new B());
```

The type of argument is supposedly determined at runtime, compiler couldn't detect arbitrary argument's types at compile without type casting. This case is called _**Multiple Dispacth**_ or either _**Multimethod**_.

### In context of Javascript with Reflectype

script for test 

```
npm run test-method-overloading-static-type-cast
```

```js
const {METHOD, parameters, type} = require('reflectype');

class A {

    foo() {}
}

class B extends A {}

class T {

    @type(A)
    accessor prop;
}

class Test {

    @parameters({
       param: A
    })
    static func(param) {

        console.log('overloaded for A');
    }

    @parameters({
        param1: B,
    })
    static [METHOD('func')](param1) {

        console.log('overloaded for B');   
    }
}
```
```JS
const T_obj = new T();
T_obj.prop = new B();

T.func(T_obj.prop);
T.func(new B());
```
result

```terminal
overloaded for A
overloaded for B
```

The code above is the Javascript conversion of the illustative C# example before. As a result, contents printed to the console is the same as the C#'s version's. Any type hinted properties of object are `static_cast`ed to the type where they are stored. In the JS example, the object that is stored at `T_obj.prop` is type of `B` but T_obj.prop type if determined as `A` so that when passing literally `test_method_overload_obj.func(T_obj.prop);` the type of the object stored at `T_obj.prop` is casted down to `A` and therefore the method with signature `func(param: A)` is dispathed.

### Multiple Dispatch Concept

### Method Overloading Resolution
## Current Benchmark State

script tested

Test directory {root}/test/reflectionQuery

```bash
# firstly, install dev packages

npm install --only=dev

# then run 

npm run test-reflect-query
```

*new benchmark

The new benchmark focused on operation's time of each phase of the algorithm. 

Execution time in detail when dispatching a 3 parameters empty body method for one hundred thousand times in 10x3 dimensions method space (when JIT do it's job in optimizing codes).

Bencmark enviroment

- Operating system: Ubuntu 23.10 linux kernel 6.5.0-25-generic (with performance mode)
- Node version: v20.11.1


Detail execution time:

- estimation phase: 0.006ms (50%)
- retrieving most specific applicable signature (lookup signature using estimated datas): 0.003ms (25%)
- down cast arguments: 0.003ms (25%)

The overall time for retrieving the most specific appplicable method for each request is around 0.004ms when requesting one hundred thousand method invocations.


It seems like the operation time of the argument down casting phase approximately equal to the estimation's time because the two operation is identical. Time complexity of the two operation is O(mm) with m is number of arguments and n is the number of each argument's class inheritance chain.

Time average for invoking such a method is 0.010ms.

time average for iterating a an one hundred thousand times empty for loop is 0.6ms.

*Current development state
- [x] Explicit type matched arguments
- [x] Interface type matched arguments
- [x] Single dispatch
- [x] Dynamic dispatch
- [x] Multiple dispatch
- [x] Nullable parameters
- [x] types coersion 

New approaches:
- [ ] argument type caching
- [x] static type binding (pure method overloading)
- [x] evaluate Any type parameters
- [ ] interface method strict parameters
