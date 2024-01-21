const matchType = require("../../libs/matchType");
const { isObject, isValuable } = require("../../libs/type");
const ReflectionQuery = require("./reflectionQuery");
const ReflectionQuerySubject = require("./reflectionQuerySubject");

/**
 * ReflectionQueryBuilder is builder class in helping ReflectionQuery instantiation,
 * It validate inputs and throw error when inputs not meet requirement
 */
module.exports = class ReflectionQueryBuilder {

    #subject;
    #field;
    #prop;
    #criteria;
    #options;

    #reflectionObject

    #reflectionQueryOptions;

    constructor(_reflectionObj, queryOptions = {}) {

        this.#reflectionObject = _reflectionObj;
        this.#reflectionQueryOptions = queryOptions;
    }

    select(_propName) {

        this.#expect(_propName, isTypeOf, [String, Symbol], 'Reflection query error: select() just accepts either string or symbol');
        this.#prop = _propName;

        return this;
    }

    from(_subject) {
       
        this.#expect(_subject, toBe, [
            ReflectionQuerySubject.STATIC,
            ReflectionQuerySubject.PROTOTYPE,
            ReflectionQuerySubject.INTERFACE
        ], 'Relection query error: invalid value passed to from()');

        this.#subject = _subject; 

        return this;
    }

    where(criteria) {

        this.#expect(criteria, isTypeOf, Object, 'Reflection query error: where() argument must be an object that represent criterias');
        this.#criteria = criteria;
        
        return this;
    }

    on(_field) {

        this.#expect(_field, isTypeOf, [String, Symbol], 'Reflection query error: on() just accepts either string or symbol');
        this.#field = _field;

        return this;
    }

    options(_options) {

        this.#expect(_options, isTypeOf, Object, 'Reflection query error: options() argument must be an object that represent the options');
        this.#options = _options;

        return this;
    }

    first() {

        this.#options ??= {};
        this.#options.onlyFirst = true;

        return this;
    }

    prolarize(...filter) {

        this.#options ??= {};
        this.#options.isPolarized = true;
        this.#options.filter = filter.length > 0 ? filter : undefined;

        return this;
    }

    build() {
        
        this.#manipulatePolarization();
        
        return new ReflectionQuery(
            {
                subject: this.#subject,
                propName: this.#prop,
                field: this.#field,
                criteria: this.#criteria,
                options: this.#options
            }, 
            this.#reflectionQueryOptions
        );
    }

    #manipulatePolarization() {

        if (
            this.#options?.isPolarized &&
            !isValuable(this.#options.filter)
        ) {

            this.#options.filter = isObject(this.#criteria) ? Reflect.ownKeys(this.#criteria) : undefined;
        }
    }

    retrieve() {

        const query = this.build();

        return this.#reflectionObject.execQuery(query);
    }

    #expect(_input, criteria, _expect, _errorMsg) {

        this.#match(_input, _expect, _errorMsg, criteria);
    }

    #match(_input, _expect, _errorMsg, _matcher) {

        if (!_matcher.call(null, _input, _expect)) {

            throw new Error(_errorMsg);
        }
    }
}

function toBe(_target, _expectation) {

    return _check(_target, _expectation, (e, v) => v === e);
}

function isTypeOf(_target, _expectation) {
    
    return _check(_target, _expectation, (type, val) => {

        return type === Symbol ? typeof val === 'symbol' : matchType;
    });   
}

function _check(_value, _expect, cb) {

    if (!Array.isArray(_expect)) {

        return cb(_expect, _value);
    }

    for (const type of _expect) {

        if (cb(type, _value)) {

            return true;
        }
    }

    return false;
}

function notNull(_target) {

    return !toBe(_target, [undefined, null]);
}

function notTypeOf(_target, _rejection) {

    return !isTypeOf(_rejection, _target);
}