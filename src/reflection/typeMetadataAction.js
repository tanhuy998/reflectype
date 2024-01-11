const { isInstantiable, isObject, isObjectKey, isNonIterableObjectKey } = require("../libs/type");
const self = require("../utils/self");
const { METADATA, TYPE_JS, metadata_t, property_metadata_t, prototype_metadata_t, metaOf } = require("./metadata");

module.exports = {
    addPropertyMetadata, 
    resolveResolutionFromArbitrayMeta, 
    strictlyResolveTypeMetaResolution, 
    establishMetadataResolution,
    hasTypeMetadata,
    isPaired,
    decorator_establishMetadataResolution
};

/**
 * Instantiate new propMeta object and attach it to the typeMeta.
 * Properties resolution is not involved.
 * 
 * @param {metadata_t} _typeMeta 
 * @param {string|symbol} _propName
 * @param {property_metadata_t} _ref 
 */
function addPropertyMetadata(_typeMeta, _propName, _ref) {

    if (!isNonIterableObjectKey(_propName)) {

        throw new TypeError('invalid type of _propName argument');
    }

    const properties = _typeMeta.properties;

    if (_propName in properties) {

        return undefined;
    }

    const propMeta = properties[_propName] = new property_metadata_t(_ref, _typeMeta);

    propMeta.owner.typeMeta = _typeMeta;
    propMeta.name = _propName;
    //console.log(propMeta)
    return propMeta;
}

/**
 * @param {metadata_t} _typeMeta
 * @param {Object} _properties 
 */
function _resolvePropertyResolution(_typeMeta, _properties) {

    const _class = _typeMeta.abstract;
    /********************************************************************
     * stuck from heare
     *******************************************************************/
    if (
        !isInstantiable(_class) ||
        //_class[METADATA] !== ownerTypeMetaWrapper
        _typeMeta.isResolutionResolved
    ) {

        return false;
    }
    
    for (const [propName,/** @type {property_metadata_t} */ propMeta] of Object.entries(_properties) || []) {
        
        if (
            propMeta.owner.isResolutionResolved &&
            propMeta.owner.typeMeta instanceof metadata_t
        ) {

            continue;
        }
        
        propMeta.owner.isResolutionResolved = true;
        propMeta.owner.typeMeta = _traceActualTypeMeta(propMeta, _typeMeta);
    }

    return true;
}

/**
 * 
 * @param {property_metadata_t} _propMeta 
 * @param {metadata_t} _typeMeta 
 * @returns {metadata_t?}
 */
function _traceActualTypeMeta(_propMeta, _typeMeta) {

    let _class = _typeMeta.abstract;

    if (
        metaOf(_class)?.constructor !== metadata_t &&
        _traceActualTypeMeta_matchWrapper(_propMeta, _typeMeta)
    ) {
        /**
         * first iteration, edge case of this algorithm.
         */
        return _typeMeta;
    }

    _class = _class.__proto__;

    while (_class) {
        
        const tempTypeMeta = metaOf(_class);
        
        if (_traceActualTypeMeta_matchWrapper(_propMeta, tempTypeMeta)) {
            
            tempTypeMeta.abstract = _class;
            return tempTypeMeta;
        }
        
        _class = _class.__proto__;
    }
}

/**
 * 
 * @param {metadata_t} _typeMeta 
 */
function _traceActualTypeMeta_firstIteration(_typeMeta) {


}

/**
 * 
 * @param {property_metadata_t} _propMeta 
 * @param {metadata_t} _typeMeta 
 */
function _traceActualTypeMeta_matchWrapper(_propMeta, _typeMeta) {

    return _propMeta.owner.classWrapper === _typeMeta.ownerClassWrapper;
}

/**
 * Resolve resolution from a particular metadata object.
 * 
 * @param {metadata_t|property_metadata_t|prototype_metadata_t} _meta 
 * @param {Function} _abstract 
 * @returns 
 */
function resolveResolutionFromArbitrayMeta(_meta, _abstract) {

    if (
        !isObject(_meta) &&
        !isInstantiable(_abstract)
    ) {

        return;
    }

    let typeMeta;

    switch(self(_meta)) {
        case property_metadata_t:
            typeMeta = _meta.owner.typeMeta;
            break;
        case prototype_metadata_t:
            typeMeta = _meta.owner.typeMeta;
            break;
        case metadata_t:
            typeMeta = _meta;
            break;
        default:
            return;
    }

    if (!isPaired(_abstract, typeMeta)) {

        return;
    }

    establishMetadataResolution(_abstract);
}

function hasTypeMetadata(_abstract) {

    if (
        isObject(_abstract[METADATA]) &&
        _abstract[METADATA][TYPE_JS] instanceof metadata_t
    ) {

        return true;
    }

    return false;
}

/**
 * 
 * @param {metadata_t} _typeMeta 
 */
function resolveProtypeResolution(_typeMeta) {

    _resolvePropertyResolution(_typeMeta, _typeMeta.properties);
}

/**
 * 
 * @param {metadata_t} _typeMeta 
 */
function resolveStaticResolution(_typeMeta) {

    _resolvePropertyResolution(_typeMeta, _typeMeta.prototype.properties);
}

/**
 * Check if the typeMeta is metadata of a class
 * 
 * @param {Function} _class 
 * @param {metadata_t} _typeMeta 
 * @returns 
 */
function isPaired(_class, _typeMeta) {

    return hasTypeMetadata(_class) &&
    _class[METADATA][TYPE_JS] == _typeMeta;
}

/**
 * 
 * @param {Function} _class 
 * @param {metadata_t} _typeMeta 
 */
function strictlyResolveTypeMetaResolution(_class, _typeMeta) {

    if (!isInstantiable(_typeMeta.abstract)) {

        throw new Error('');
    }

    if (!isPaired(_class, _typeMeta)) {

        return;
    }
    
    _typeMeta.abstract = _class;
    _typeMeta.prototype.abstract = _class;

    _resolveTypeResolution(_typeMeta);
}

/**
 * 
 * @param {metadata_t} _typeMeta 
 */
function _resolveTypeResolution(_typeMeta) {

    _typeMeta.isResolutionResolved ||= resolveStaticResolution(_typeMeta) &&
                                    resolveProtypeResolution(_typeMeta);
}

/**
 * This function is used when reflector read metadata of a class
 * 
 * @param {Function} _abstract 
 * @returns 
 */
function establishMetadataResolution(_abstract) {
    
    const typeMeta = metaOf(_abstract);

    if (!(typeMeta instanceof metadata_t)) {

        return;
    }

    if (typeMeta.isResolutionResolved) {

        return;
    }
    //typeMeta.abstract ||= _abstract;
    strictlyResolveTypeMetaResolution(_abstract, typeMeta);
}

/**
 * 
 * @param {metadata_t} _typeMeta 
 */
function decorator_establishMetadataResolution(_typeMeta) {

    _resolveTypeResolution(_typeMeta)
}

