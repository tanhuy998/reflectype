/** @type {Symbol} */
const METADATA = Symbol(Date.now());

const TYPE_JS = Symbol(Date.now);

// const Interface = require('../interface/interface.js');
// try {

//     METADATA = require('@tanhuy998/context-js');
// }
// catch {

//     METADATA = Symbol(Date.now());
// }

/**@class */
function metadata_t(_abstract) {

    this.abstract = _abstract;
    this.properties = {};
    //this.inheritance = null;
}


/**@class */
function property_metadata_t() {

    this.private = undefined;
    this.static = undefined;
    this.type = undefined;
    this.value = undefined;
    this.isMethod = undefined;
}

function metaOf(_unknown) {

    const wrapper = _unknown[METADATA];

    return typeof wrapper === 'object' ? wrapper[TYPE_JS] : undefined;
}

function compareRelation(_left, _right) {

    if (!_left && !_right) {

        return undefined;
    }
    else if (!_left) {

        return _right;
    }
    else if (!_right) {

        return _left;
    }
}

function isAbstract(_unknown) {

    return typeof _unknown === 'function' && typeof _unknown.prototype === 'object';
}

module.exports = {
    METADATA, TYPE_JS, metaOf, metadata_t, property_metadata_t
};