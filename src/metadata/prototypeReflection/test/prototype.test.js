const { ReflectionClassPrototype, ReflectionPrototypeMethod, ReflectionPrototypeProperty, ReflectionPrototypeAttribute } = require('../index');

const ReflectionPrototypeMethodParameter = require('../../parameter/reflectionPrototypeMethodParameter');

const {A, B, C} = require('./class.babel.js');
const { describe, test, expect, it } = require('@jest/globals');
const exp = require('constants');

describe('Test reflection class prototype', function () {

    const r1 = new ReflectionClassPrototype(A);
    const r2 = new ReflectionClassPrototype(B);
    const r3 = new ReflectionClassPrototype(C);

    test("Reflection on classes prototype should be valid", () => {

        expect(r1.isValid).toBe(true);
        expect(r2.isValid).toBe(true);
        expect(r3.isValid).toBe(true);
    });

    test("Reflect properties of class's prototype", () => {
        
        expect(r1.properties).toHaveLength(3);
        expect(r2.properties).toHaveLength(2);
        expect(r3.properties).toHaveLength(1);
    });

    test("Reflect Methods of class's prototype", () => {

        expect(r1.methods).toHaveLength(1);
        expect(r2.methods).toBeUndefined();
        expect(r3.methods).toHaveLength(1);
    });

    test("Reflect attributes of class's prototype", () => {

        expect(r1.attributes).toHaveLength(2);
        expect(r2.attributes).toHaveLength(2);
        expect(r3.attributes).toBeUndefined();
    })
});

