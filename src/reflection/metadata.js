/** @type {Symbol} */
const METADATA = Symbol.metadata || Symbol(Date.now());

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
    this.interfaces = undefined;
    //this.inheritance = null;
}


/**@class */
function property_metadata_t() {

    this.private = undefined;
    this.static = undefined;
    this.type = undefined;
    this.value = undefined;
    this.isMethod = undefined;
    this.name = undefined;
    this.allowNull = undefined;
}

function metaOf(_unknown) {

    if (!_unknown) {

        return;
    }

    const wrapper = _unknown[METADATA];

    return typeof wrapper === 'object' ? wrapper[TYPE_JS] : undefined;
}


function isAbstract(_unknown) {

    return typeof _unknown === 'function' && typeof _unknown.prototype === 'object';
}

module.exports = {
    METADATA, TYPE_JS, metaOf, metadata_t, property_metadata_t
};