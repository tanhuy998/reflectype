const ReflectionQuery = require("./reflectionQuery")

module.exports = class ReflectionQueryBuilder {

    #subject;
    #field;
    #prop;

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

    on(_field) {

        this.#field = _name;

        return this;
    }

    build() {

        return new ReflectionQuery({
            subject: this.#subject,
            propName: this.#prop,
            field: this.#field
        });
    }

    retrieve() {

        const query = this.build();

        return this.#reflectionObject.execQuery(query);
    }
}