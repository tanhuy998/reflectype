const {ReflectionStaticAttribute} = require('../index.js')

const ReflectionPrototypeMethodParameter = require('../../parameter/reflectionPrototypeMethodParameter');

const {A, B, C} = require('./class.babel.js');
const { describe, test, expect, it } = require('@jest/globals');

describe("Test reflection attributes of class's prototype", () => {

    const r1 = new ReflectionStaticAttribute(A, 'prop');
    const r2 = new ReflectionStaticAttribute(B, 'prop');
    const r3 = new ReflectionStaticAttribute(C, 'prop');
    
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