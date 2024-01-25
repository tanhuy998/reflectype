const {ReflectionStaticMethod} = require('../index.js')

const ReflectionParam = require('../../parameter/reflectionClassMethodParameter.js');

const {A, B, C} = require('./class.babel.js');
const { describe, test, expect, it } = require('@jest/globals');
const exp = require('constants');

describe("Test reflection method of class's prototype", () => {

    const r1 = new ReflectionStaticMethod(A, '#func');
    const r2 = new ReflectionStaticMethod(B, '#func');
    const r3 = new ReflectionStaticMethod(C, 'func');

    const params = r1.parameters;

    test.each([
        {reflection: r1, isValid: true, isPrivate: true, ownerClass: A},
        {reflection: r2, isValid: true, isPrivate: true, ownerClass: A},
        {reflection: r3, isValid: false, isPrivate: undefined, ownerClass: undefined}
    ])
    ("Test basic properties of RelectionPrototypeMethod", ( {reflection, isValid, isPrivate, ownerClass}) => {

        expect(reflection.isValid).toBe(isValid);
        expect(reflection.isPrivate).toBe(isPrivate);
        expect(reflection.ownerClass).toBe(ownerClass);
    }) 

    test("Test quantity of parameters reflection returned by ReflectionPrototypeMethod.parameters", () => {

        expect(params).toHaveLength(2);
    })

    test.each([
        {param: params[0], expectedState: false, expectetType: undefined},
        {param: params[1], expectedState: true, expectetType: Boolean},
    ])
    ("Test parameter reflections returned by ReflectionPrototypeMethod.parameters", ({param, expectedState, expectetType}) => {

        expect(param).toBeInstanceOf(ReflectionParam);
        expect(param.isValid).toBe(expectedState);
        expect(param.type).toBe(expectetType);
    });
});