const {ReflectionClassMethodParameter, ReflectionPrototypeMethodParameter} = require('../index.js')

const {A, B, C} = require('./class.babel.js');
const { describe, test, expect, it } = require('@jest/globals');

describe("Test Reflection class static method's parameters", () => {

    test("Retrieve static method's parameter reflection by index", () => {

        const ref = new ReflectionClassMethodParameter(A, '#func', 0);

        expect(ref.isValid).toBe(true);
    });

    test("Retrieve static method's parameter reflection by parameter's name", () => {

        const ref = new ReflectionClassMethodParameter(A, '#func', 'a');

        expect(ref.isValid).toBe(true);
    });

    test("retrieve static method's parameter reflection of method whose parameters were not defined", () => {

        const ref = new ReflectionClassMethodParameter(A, 'anotherFunc', 'a');
        
        expect(ref.isValid).toBe(false);
    });
});

describe("Test Reflection class's prototype method's parameters", () => {

    test("Retrieve class's prototype method's parameter reflection by index", () => {

        const ref = new ReflectionPrototypeMethodParameter(A, 'func', 0);

        expect(ref.isValid).toBe(true);
    });

    test("Retrieve class's prototype method's parameter reflection by parameter's name", () => {

        const ref = new ReflectionPrototypeMethodParameter(A, 'func', 'a');

        expect(ref.isValid).toBe(true);
    });

    test("retrieve class's prototype method's parameter reflection of method whose parameters were not defined", () => {

        const ref = new ReflectionPrototypeMethodParameter(A, 'test', 'c');
        
        expect(ref.isValid).toBe(false);
    });
})