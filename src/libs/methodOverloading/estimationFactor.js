const { NULLABLE } = require("./constant");

module.exports = {
    estimation_complex_t,
    function_signature_vector,
    estimation_report_t
}

function estimation_complex_t(type, delta, imaginary) {

    /**
     * @type {Function}
     */
    this.type = typeof type === 'function' || type === NULLABLE ? type : undefined;

    /**
     * @type {number}
     */
    this.delta = typeof delta === 'number' ? delta : 0;

    /**
     * @type {number}
     */
    this.imaginary = typeof imaginary === 'number' ? imaginary : 0;
}

function estimation_report_t(est, masses, hasNullable) {

    /**
     * @type {Array<Function>}
     */
    this.estimations = Array.isArray(est) ? est : undefined;

    /**
     * @type {number}
     */
    this.argMasses = Array.isArray(masses) ? masses : undefined;

    /**
     * @type {boolean}
     */
    this.hasNullable = typeof hasNullable === 'boolean' ? hasNullable : false;
}

/**
 * 
 * @param {number} mass 
 * @param {number} imaginary 
 */
function function_signature_vector(mass, imaginary) {

    /**
     * Mass is sum of inheritance chain of all signature types 
     * 
     * @type {number}
     */
    this.mass;

    /**
     * @type {number}
     */
    this.imaginary;
} 