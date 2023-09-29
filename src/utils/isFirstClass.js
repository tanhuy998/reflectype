const isAbastract = require('./isAbstract');

function isFirstClass(_target) {

    if (!isAbastract(_target)) {

        return false;
    }

    return (_target.__proto__.name === '');
}

module.exports = isFirstClass;