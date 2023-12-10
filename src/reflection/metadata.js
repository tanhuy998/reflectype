/** @type {Symbol} */
const METADATA = Symbol.metadata || Symbol.for('Symbol.metadata') || Symbol(Date.now());

const TYPE_JS = Symbol(Date.now);

// const Interface = require('../interface/interface.js');
// try {

//     METADATA = require('@tanhuy998/context-js');
// }
// catch {

//     METADATA = Symbol(Date.now());
// }

/**@class */
function metadata_t(_abstract, _ref) {

    this.abstract = _ref?.abstract ?? _abstract;
    this.properties = {};
    this.interfaces = _ref?.interfaces;
    //this.inheritance = null;
}


/**@class */
function property_metadata_t(_ref) {

    this.private = _ref?.private;
    this.static = _ref?.static;
    this.type = _ref?.type;
    this.value = _ref?.value;
    this.defaultParamsType = _ref?.defaultParamsType;
    this.isMethod = _ref?.isMethod;
    this.name = _ref?.name;
    this.allowNull = _ref?.allowNull;
}

// function cloneTypeMeta(_ref) {

//     const type = _ref?.constructor;

//     if (typeof type !== 'function') {

//         return;
//     }

//     switch(type) {

//         case metadata_t:
//             return clone_metadata_t(_ref);
//         case property_metadata_t:
//             return clone_property_metadata_t(_ref);
//         default
//             return undefined;
//     }
// }

// function clone_metadata_t(_ref) {

//     return new metadata_t()
// }

// function clone_property_metadata_t (_ref) {

//     const ret = new property_metadata_t();

//     ret

//     return ret;
// }

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