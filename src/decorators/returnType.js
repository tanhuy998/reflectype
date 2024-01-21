const Void = require('../type/void.js');
const { markAsDecorator } = require('../utils/decorator/general.js');
const type = require('./type.js');

function returnType(_type) {

    function returnTypeDecorator(_method, _context) {

        const {kind} = _context;

        if (kind !== 'method') {

            throw new Error('@returnType just affect on method');
        }

        return type(_type)(_method, _context);
    }

    markAsDecorator(returnTypeDecorator);
    return returnTypeDecorator;
}

module.exports = returnType;