const { NULLABLE, ESTIMATION_MASS } = require("./constant");

class EstimationPieace extends Array {

    /**
     * @type {Function|symbol}
     */
    inputType;

    /**
     *  @type {number}
     */
    [ESTIMATION_MASS] = 0;

    /**
     *  @type {boolean}
     */
    [NULLABLE] = false;

    constructor(inputType) {

        super();
        this.inputType = inputType;
    }
}

module.exports = {
    estimation_complex_t,
    vector,
    estimation_report_t,
    EstimationPieace,
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
     * @type {Array<EstimationPieace>}
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

// function estimation_piece_t() {

//     /**
//      * @type {Array<estimation_complex_t>}
//      */
//     this.complexList = [];
// }

/**
 * 
 * @param {number} mass 
 * @param {number} imaginary 
 */
function vector(real, imaginary) {

    /**
     * Mass is sum of inheritance chain of all signature types 
     * 
     * @type {number}
     */
    this.real = typeof real === 'number' ? real : 0;

    /**
     * @type {number}
     */
    this.imaginary = typeof imaginary === "number" ? imaginary : 0;
} 