const { metaOf, function_metadata_t, metadata_t } = require("../reflection/metadata");
const self = require("../utils/self");
const config = require('../../config.json');
const { isInstantiable } = require("./type");
const { extractClassConstructorInformations, extractFunctionInformations } = require("../utils/function.util");
const { resolveTypeMetaResolution } = require("./metadata/resolution");
const { retrieveTypeMetadata } = require("./metadata/metadataTrace");

module.exports = {
    initConstructorMetadata,
    discoverClassConstructor,
    initGeneralMetadata
}

function initGeneralMetadata(_, decoratorContext) {

    initConstructorMetadata(...arguments);
    manipulateMetadataResolution(...arguments);
}

function manipulateMetadataResolution(_, decoratorContext) {

    const typeMeta = retrieveTypeMetadata(_, decoratorContext);

    decoratorContext.addInitializer(function() {

        if (typeof typeMeta.loopback !== 'object') {

            return;
        }

        const _class = isInstantiable(this) ? this : self(this);
        
        resolveTypeMetaResolution(_class, typeMeta)
    });
}

function initConstructorMetadata(_, decoratorContext) {

    const {addInitializer} = decoratorContext;

    addInitializer(discoverClassConstructor);
}

function discoverClassConstructor() {

    /**@type {Function} */
    const abstract = isInstantiable(this) ? this : self(this);

    if (typeof abstract !== 'function') {

        return;
    }

    /**@type {metadata_t} */
    const typeMeta = metaOf(abstract);

    if (!(typeMeta instanceof metadata_t)) {

        return;
    }

    if (typeMeta._constructor instanceof function_metadata_t) {

        return;
    }

    typeMeta._constructor = config.reflectypeOfficialDecorator === true ? 
                            extractClassConstructorInformations(abstract)
                            : extractFunctionInformations(abstract);
}