const Void = require('../type/void.js');
const type = require('./type.js');

function returnType(_type) {

    return function (_method, _context) {

        const {kind} = _context;

        if (kind !== 'method') {

            throw new Error('@returnType just affect on method');
        }

        return type(_type)(_method, _context);
    }
}

module.exports = returnType;