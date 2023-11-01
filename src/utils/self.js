/**
 * @description a shortcut to get access to basse class of an object
 * 
 * @param {Object} _object 
 * 
 * @returns base class of the object
 */
function self(_object) {

    return _object?.constructor;
}

module.exports = self;