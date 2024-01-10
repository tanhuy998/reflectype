const {METADATA, TYPE_JS} = require('./reflection/metadata.js');

module.exports = {
    INTERFACE_PROTOTYPE: Symbol(Date.now()),
    INTERFACES: Symbol(Date.now()),
    REFLECTION: Symbol(Date.now()),
    IS_CHECKABLE: require('./interface/constant.js').IS_CHECKABLE,
    EXPORT: Symbol(Date.now()),
    GET: Symbol(Date.now()),
    METADATA, TYPE_JS
};
