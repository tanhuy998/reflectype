/**
 * Check if a class has derived the other class
 * 
 * @param {any} _target
 * @param {any} _baseClass
 * @return {Boolean}
 */
function checkRelation(_target, _baseClass) {

    if (_target === _baseClass) {

        return true;
    }

    let proto = _target?.__proto__;

    while (proto && proto !== Object) {

        if (proto === _baseClass) {

            return true;
        }

        proto = proto?.__proto__;
    }

    return false;
}

module.exports = checkRelation;