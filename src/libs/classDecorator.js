// const { establishMetadataResolution, decorator_establishMetadataResolution } = require("../reflection/typeMetadataAction");
const { METADATA, TYPE_JS } = require("../constants");
const { metaOf } = require("../reflection/metadata");
const { initConstructorMetadata, initGeneralMetadata } = require("./decoratorGeneral");
const { refreshTypeMetadata } = require("./metadata/metadataTrace");
const { resolveTypeMetaResolution } = require("./metadata/resolution");

module.exports = {
    initTypeMeta,
};

function initTypeMeta(_class, _decoratorContext) {

    const typeMeta = refreshTypeMetadata(_class, _decoratorContext);
    const {metadata} = _decoratorContext;
    const legacyTypeMeta = metaOf(_class);

    if (
        !legacyTypeMeta
        || legacyTypeMeta.abstract !== _class
    ) {
        
        Object.defineProperty(_class, METADATA, {
            configurable: true,
            enumerable: true,
            //writable: false,
            value: Object.setPrototypeOf({}, metadata)  
        })
    }

    // for (const [key, propMeta] of  Object.entries(metadata[TYPE_JS]._prototype.properties)) {

    //     if (
    //         !propMeta.isMethod
    //         || propMeta.owner.typeMeta !== metadata[TYPE_JS]
    //     ) {

    //         continue;
    //     }

    //     console.log(propMeta.name)
    // }

    initGeneralMetadata(_class, _decoratorContext);
    //resolveTypeMetaResolution(_class, typeMeta);
    //initConstructorMetadata(...arguments);
    //decorator_establishMetadataResolution(typeMeta);

    return typeMeta;
}