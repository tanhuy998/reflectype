const ReflectionPrototypeMethod = require('../../../metadata/prototypeReflection/reflectionPrototypeMethod');
const {Z, A, B, C, D, E, F, G, H} = require('./class.babel');

const { describe, test, expect, it } = require('@jest/globals');

/**
 *  Relations between classes, (d) to indicate decorated classes
 *  
 *  G <- (d)F <- E <- (d)D <- C <- B <- (d)A <- Z
 * 
 *  (d)H <- C
 */

describe("Check for the accuracy of metadata resolution", () => {

    test("Undecorated class inherits decorated class without overriding base class property", () => {

        const refB = new ReflectionPrototypeMethod(B, 'func');

        expect(refB.isValid).toBe(true);
        expect(refB.returnType).toBe(Number);
    });

    test("Multiple undecorated classes inherit decorated class without overriding base class property", () => {

        const refA = new ReflectionPrototypeMethod(A, 'func');
        const refC = new ReflectionPrototypeMethod(C, 'func');
        const refB = new ReflectionPrototypeMethod(B, 'func');

        expect(refA.isValid).toBe(true);
        expect(refB.isValid).toBe(true);
        expect(refB.returnType).toBe(Number);

        expect(refC.isValid).toBe(true);
        expect(refC.returnType).toBe(refB.returnType);
        expect(refC.returnType).toBe(refA.returnType);
    })

    test("[should fail] Test undecorated class that overrides base class's property whose class is decorated", () => {
        /**
         * This test fail because babel-jest tranform undecorated classes,
         */
        const refE = new ReflectionPrototypeMethod(E, 'func');
        const refD = new ReflectionPrototypeMethod(D, 'func');

        expect(refD.isValid).toBe(true);
        expect(refE.isValid).toBe(false);

        expect(refD.returnType).toBe(Boolean);
        expect(refE.returnType).toBeUndefined();
    })
})