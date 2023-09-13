const { compileFunction } = require("vm");

function isAbStract(_unknown) {

    if (typeof _unknown === 'function' && typeof _unknown.prototype === 'object') {

        return true;
    }

    return false;
}

module.exports = isAbStract;