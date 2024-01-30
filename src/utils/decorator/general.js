const { IS_DECORATOR, IS_PARAM_DESTRUCTURE } = require("./constant");

module.exports = {
    markAsDecorator,
    markAsDestructureParamDecorator
}

function markAsDestructureParamDecorator(func) {

    checkFunction(func);
    func[IS_PARAM_DESTRUCTURE] = true;

}

function markAsDecorator(func) {
    
    checkFunction(func);
    func[IS_DECORATOR] = true;
}

function checkFunction(func) {

    if (
        typeof func !== 'function' &&
        typeof func !== Proxy
    ) {

        throw new TypeError('cannot mark no function like as a decorator');
    }
}