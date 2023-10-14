const { compileFunction } = require("vm");

function isAbStract(_unknown) {

    if (typeof _unknown === 'function' && typeof _unknown.prototype === 'object') {

        return true;
    }

    return false;
}

function isInstantiate(_func) {

    const prototypeKeys = Reflect.ownKeys(_func.prototype);

    return prototypeKeys.includes('constructor') && prototypeKeys.length > 1;
}

module.exports = isAbStract;