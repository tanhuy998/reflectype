const type = require('./type.js');
const abstractMap = require('../utils/abstractMap.js');

function hintable(_class, {kind}) {

    if (kind !== 'class') {

        throw new TypeError('decorator @hint just works with class');
    }

    const proxy = new Proxy(_class, {
        apply: function (target, _this, _args) {

            const decorated = type(target);

            return decorated(..._args);
        }
    })

    abstractMap.set(_class, proxy);

    return proxy;
}

module.exports = hintable;