
function isIterable(_object) {

    return typeof _object === 'object' && typeof _object[Symbol.iterator] === 'function';
}

module.exports = isIterable;