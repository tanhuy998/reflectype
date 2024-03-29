// const { establishMetadataResolution, decorator_establishMetadataResolution } = require("../reflection/typeMetadataAction");
const { initConstructorMetadata } = require("./decoratorGeneral");
const { refreshTypeMetadata } = require("./metadata/metadataTrace");
const { resolveTypeMetaResolution } = require("./metadata/resolution");

module.exports = {
    initTypeMeta,
};

function initTypeMeta(_class, _decoratorContext) {

    const typeMeta = refreshTypeMetadata(_class, _decoratorContext);
    resolveTypeMetaResolution(_class, typeMeta);
    initConstructorMetadata(...arguments);
    //decorator_establishMetadataResolution(typeMeta);

    return typeMeta;
}