const {ReflectionClass, ReflectionStaticProperty, ReflectionStaticMethod, ReflectionStaticAttribute} = require('../index.js')

const ReflectionPrototypeMethodParameter = require('../../parameter/reflectionPrototypeMethodParameter.js');

const {A, B, C} = require('./class.babel.js');
const { describe, test, expect, it } = require('@jest/globals');
const exp = require('constants');

describe('Test reflection class', function () {

    const r1 = new ReflectionClass(A);
    const r2 = new ReflectionClass(B);
    const r3 = new ReflectionClass(C);

    test("Reflection on classes should be valid", () => {

        expect(r1.isValid).toBe(true);
        expect(r2.isValid).toBe(true);
        expect(r3.isValid).toBe(true);
    });

    test("Reflect static properties of classes", () => {
        
        expect(r1.properties).toHaveLength(2);
        expect(r2.properties).toHaveLength(2);
        expect(r3.properties).toBeUndefined();

        expect(r1.properties[0]).toBeInstanceOf(ReflectionStaticProperty);
    });

    test("Reflect static Methods of class's prototype", () => {

        expect(r1.methods).toHaveLength(1);
        expect(r2.methods).toHaveLength(1);
        expect(r3.methods).toBeUndefined();

        expect(r1.methods[0]).toBeInstanceOf(ReflectionStaticMethod);
    });

    test("Reflect static attributes of class's prototype", () => {

        expect(r1.attributes).toHaveLength(1);
        expect(r2.attributes).toHaveLength(1);
        expect(r3.attributes).toBeUndefined();

        expect(r1.attributes[0]).toBeInstanceOf(ReflectionStaticAttribute);
    })
});

