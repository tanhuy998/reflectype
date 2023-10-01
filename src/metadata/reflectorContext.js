/**@enum */
class ReflectorContext {

    static get ABSTRACT() {

        return 0;
    }

    static get INSTANCE() {

        return 1;
    }

    static get OTHER() {

        return 2;
    }
}

module.exports = ReflectorContext;