const { IS_DECORATOR } = require("./constant");

module.exports = {
    markAsDecorator
}

function markAsDecorator(func) {
    
    if (
        typeof func !== 'function' &&
        typeof func !== Proxy
    ) {

        throw new TypeError('cannot mark no function like as a decorator');
    }

    func[IS_DECORATOR] = true;
}