/**
 * ReflectorContext is Enum that annotates whose context which 
 * Reflectors take effect on
 * 
 * @enum
 */
class ReflectorContext {

    /**
     * When Reflectors applied on a Class
     */
    static get ABSTRACT() {

        return 0;
    }

    /**
     * When Reflectors applied on an instance
     */
    static get INSTANCE() {

        return 1;
    }

    /**
     * When Reflectors applied on special situation 
     * like a class method that holds metadata on itself
     */
    static get OTHER() {

        return 2;
    }

    /**
     *  Is used for PrototypeReflector
     */
    static get PROTOTYPE() {

        return 3;
    }
}

module.exports = ReflectorContext;