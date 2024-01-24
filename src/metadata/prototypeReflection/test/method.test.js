const { ReflectionClassPrototype, ReflectionPrototypeMethod, ReflectionPrototypeProperty, ReflectionPrototypeAttribute } = require('../index');

const ReflectionPrototypeMethodParameter = require('../../parameter/reflectionPrototypeMethodParameter');

const {A, B, C} = require('./class.babel.js');
const { describe, test, expect, it } = require('@jest/globals');
const exp = require('constants');

describe("Test reflection method of class's prototype", () => {

    const r1 = new ReflectionPrototypeMethod(A, 'func');
    const r2 = new ReflectionPrototypeMethod(B, 'func');
    const r3 = new ReflectionPrototypeMethod(C, 'func');

    const params = r3.parameters;

    test.each([
        {reflection: r1, isValid: true, isPrivate: false, ownerClass: A},
        {reflection: r2, isValid: false, isPrivate: undefined, ownerClass: undefined},
        {reflection: r3, isValid: true, isPrivate: false, ownerClass: C}
    ])
    ("Test basic properties of RelectionPrototypeMethod", ( {reflection, isValid, isPrivate, ownerClass}) => {

        expect(reflection.isValid).toBe(isValid);
        expect(reflection.isPrivate).toBe(isPrivate);
        expect(reflection.ownerClass).toBe(ownerClass);
    }) 

    test("Test quantity of parameters reflection returned by ReflectionPrototypeMethod.parameters", () => {

        expect(params).toHaveLength(3);
    })

    test("Test overriden method that was not decorated", () => {
        
        expect(r2.isValid).toBe(false);
    })

    test("Test owner class of Reflection method", () => {
        
        expect(r1.ownerClass).toBe(A);
        expect(r3.ownerClass).toBe(C);
    });

    test.each([
        [params[0], true, Function],
        [params[1], true, Number],
        [params[2], false, undefined]
    ])
    ("Test parameter reflections returned by ReflectionPrototypeMethod.parameters", (param, expectedState, expectetType) => {

        expect(param).toBeInstanceOf(ReflectionPrototypeMethodParameter);
        expect(param.isValid).toBe(expectedState);
        expect(param.type).toBe(expectetType);
    });
});