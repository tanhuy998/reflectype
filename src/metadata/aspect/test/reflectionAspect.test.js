const { prototype_metadata_t } = require('../../../reflection/metadata');
const ReflectionQuerySubject = require('../../query/reflectionQuerySubject');
const Reflector = require('../../reflector');
const ReflectionAspect = require('../reflectionAspect');
const {A} = require('./class.babel');

const { describe, test, expect, it } = require('@jest/globals');

describe("", () => {

    const reflector = new Reflector(A);
    const aspect = new ReflectionAspect(reflector);

    test("Test reflection aspect default query", () => {

        const defaultQuery = aspect.query().retrieve();
        const res = aspect.query()  
                    .from(ReflectionQuerySubject.STATIC)
                    .retrieve();
        
        expect(res).toBeInstanceOf(Object);
        expect(res).toEqual(defaultQuery);
    });

    test("", () => {

    });

    test("Test reflection aspect query metadata from reflection subject", () => {

        //const proto = aspect.query().from(ReflectionQuerySubject.PROTOTYPE).retrieve();
        const res = aspect.query().from(ReflectionQuerySubject.PROTOTYPE).retrieve();

        expect(res).toBeInstanceOf(Object);
        expect(res).toBeInstanceOf(prototype_metadata_t);
    });  
})