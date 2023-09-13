function immediateValueCheck(_target) {

    if (typeof _target !== 'function' && !_target.prototype) {

        throw new TypeError('require a constructor, immediate value given');
    }
}

module.exports = immediateValueCheck;