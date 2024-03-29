const { ReflectionClassPrototype, ReflectionPrototypeMethod, ReflectionPrototypeProperty, ReflectionPrototypeAttribute } = require('../index');

const ReflectionPrototypeMethodParameter = require('../../parameter/reflectionPrototypeMethodParameter');

const {A, B, C} = require('./class.babel.js');
const { describe, test, expect, it } = require('@jest/globals');

describe("Test reflection attributes of class's prototype", () => {

    const r1 = new ReflectionPrototypeAttribute(A, 'prop');
    const r2 = new ReflectionPrototypeAttribute(B, 'prop');
    const r3 = new ReflectionPrototypeAttribute(C, 'prop');
    
    test.each([
        {reflection: r1, isValid: true, isPrivate: false, ownerClass: A},
        {reflection: r2, isValid: true, isPrivate: false, ownerClass: B},
        {reflection: r3, isValid: false, isPrivate: undefined, ownerClass: undefined}
    ])
    ("Test basic properties of RelectionPrototypeAttribute", ( {reflection, isValid, isPrivate, ownerClass}) => {

        expect(reflection.isValid).toBe(isValid);
        expect(reflection.isPrivate).toBe(isPrivate);
        expect(reflection.ownerClass).toBe(ownerClass);
    });
});