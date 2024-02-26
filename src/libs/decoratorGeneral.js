const { metaOf, function_metadata_t, metadata_t } = require("../reflection/metadata");
const self = require("../utils/self");
const config = require('../../config.json');
const { isInstantiable } = require("./type");
const { extractClassConstructorInformations, extractFunctionInformations, extractClassConstructorInfoBaseOnConfig } = require("../utils/function.util");
const { resolveTypeMetaResolution } = require("./metadata/resolution");
const { retrieveTypeMetadata } = require("./metadata/metadataTrace");

const INITIALIZED_META_WRAPPER = new Set();

module.exports = {
    initConstructorMetadata,
    discoverClassConstructor,
    initGeneralMetadata
}

function initGeneralMetadata(_, decoratorContext) {

    const {metadata} = decoratorContext;

    if (INITIALIZED_META_WRAPPER.has(metadata)) {

        return;
    }

    initConstructorMetadata(...arguments);
    manipulateMetadataResolution(...arguments);

    INITIALIZED_META_WRAPPER.add(metadata);
}

function manipulateMetadataResolution(_, decoratorContext) {

    const typeMeta = retrieveTypeMetadata(_, decoratorContext);

    decoratorContext.addInitializer(function() {

        if (typeMeta.pendingError) {

            throw typeMeta.pendingError;
        }

        if (typeof typeMeta.loopback !== 'object') {

            return;
        }

        const _class = isInstantiable(this) ? this : self(this);
        
        try {

            //assignAbstractToTypeMeta(_class, typeMeta);
            resolveTypeMetaResolution(_class);
        }
        catch (e) {

            typeMeta.pendingError = e;

            throw e;
        }
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

    typeMeta._constructor = extractClassConstructorInfoBaseOnConfig(abstract);
}