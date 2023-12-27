const ReflectionQuery = require("./reflectionQuery")

module.exports = class ReflectionQueryBuilder {

    #subject;
    #field;
    #prop;
    #criteria;
    #options;

    #reflectionObject

    constructor(_reflectionObj) {

        this.#reflectionObject = _reflectionObj;
    }

    select(_propName) {

        this.#prop = _propName;

        return this;
    }

    from(_subject) {

        this.#subject = _subject; 

        return this;
    }

    where(criteria) {

        this.#criteria = criteria;

        return this;
    }

    on(_field) {

        this.#field = _field;

        return this;
    }

    options(_options) {

        this.#options = _options;

        return this;
    }

    first() {

        this.#options ??= {};
        this.#options.onlyFirst = true;

        return this;
    }

    build() {

        return new ReflectionQuery({
            subject: this.#subject,
            propName: this.#prop,
            field: this.#field,
            criteria: this.#criteria,
            options: this.#options
        });
    }

    retrieve() {

        const query = this.build();

        return this.#reflectionObject.execQuery(query);
    }
}