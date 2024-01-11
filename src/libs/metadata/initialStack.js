const { metadata_t, property_metadata_t } = require("../../reflection/metadata");
const MetaStack = require("./metaStack");

module.exports = {
    classStack: new MetaStack(metadata_t),
    propStack: new MetaStack(property_metadata_t),
    globalStack: new MetaStack(Object),
}