const { METADATA } = require("../../constants");
const { metadata_t, metaOf, prototype_metadata_t, property_metadata_t, wrapperOf, method_variant_map_metadata_t } = require("../../reflection/metadata");
const { extractClassConstructorInfoBaseOnConfig } = require("../../utils/function.util");
const { DECORATED_VALUE } = require("../constant");
const { getMetadataFootPrintByKey } = require("../footPrint");
const { isFirstClass } = require("../type");
const { refreshTypeMetaObjectForDecoratorMetadata } = require("./metadataTrace");

const RESOLVED_CLASSES = new Set();

module.exports = {
    resolveTypeMetaResolution,
    recursiveResolveResolution,
};

/**
 *  Metadata resolution
 *  There are two situations that metadata resolution must be evaluated:
 *  - When an instance of a class is instantiated.
 *  - When a reflection reads metadata of a class.
 *  Metadata resolution is evaluated on a class when the first of the above actions occurs.
 * 
 *  when classes inherit another, they would acquire it's base class type meta.
 *  There are no problems when a decorated class inherits another decorated class
 *  because decorators "know" (not yet) which class (exactly decorator metadata context) that
 *  they're placed.
 *  Problems just come when undecorated classes inherit decorated classes.
 *  When we reflect on an undecorated class that inherits decorated class, it's override
 *  properties on base's class decorated properties would be invalid convention.  
 *
 *  Consider this situation:
 *  
 *  class A {
 *      
 *      @returnType(String)
 *      func() {
 *          
 *          return 'foo';
 *      }
 *  }
 * 
 *  class B extends A {
 *      
 *      func() {
 *          
 *          
 *      }
 *  }
 * 
 *  const refl = new ReflectionPrototypeMethod(B, 'func');
 *  
 *  refl.isValid // should be false
 *  refl.returnType // should be undefined
 * 
 *  When metadata resolution progress no in action. Any reflections on method B.func() 
 *  should be considered as invalid reflections, but the result would be a valid reflection 
 *  and the return type of the method that the reflection retrieves from the class's metadata
 *  is [String] because the metadata belongs to class A. 
 * 
 *  Two common types of the problem are:
 *  U <- D <- U   or   D <- U <- D
 *  
 *  => ...U <- ...D <- ...U   or  ...D <- ...U <- ...D 
 */

/**
 * 
 * @param {Function} _class 
 * @returns 
 */
function recursiveResolveResolution(_class) {
    
    if (!needToBeManipulateResolution(_class)) {

        return;
    }

    const stack = [];
    
    while (_class !== Function.__proto__) {

        if (!needToBeManipulateResolution(_class)) {

            break;
        }

        stack.push(_class);
        _class = _class.__proto__;
    }   

    manipulateMetaDependentClasses(stack);
}

function needToBeManipulateResolution(_class) {

    return !RESOLVED_CLASSES.has(_class) &&
            METADATA in _class &&
            metaOf(_class) instanceof metadata_t;
}

function manipulateMetaDependentClasses(stack = []) {

    while (stack.length) {

        const currentClass = stack.pop();

        checkAndReAssignMetaWrapper(currentClass);

        const typeMeta = metaOf(currentClass);
        typeMeta._constructor = extractClassConstructorInfoBaseOnConfig(currentClass);

        assignAbstractToTypeMeta(currentClass, typeMeta);
        assignMethodVariantTrie(currentClass);
        unlinkIndependentPropeMeta(currentClass);
        //show(currentClass)
        RESOLVED_CLASSES.add(currentClass);
    }
}

function assignMethodVariantTrie(_class) {

    // if (isFirstClass(_class)) {

    //     return;
    // }

    const baseClass = Object.getPrototypeOf(_class);
    const baseTypeMeta = metaOf(baseClass);

    // if (!baseTypeMeta) {

    //     return;
    // }

    /**@type {method_variant_map_metadata_t} */
    const baseClassMethodVariantMaps = baseTypeMeta?.methodVariantMaps;
    const currentClassMeta = metaOf(_class);
    /**@type {method_variant_map_metadata_t} */
    const currentClassMethodVariantMaps = currentClassMeta.methodVariantMaps = new method_variant_map_metadata_t();

    /**
     * initialize parameter types statistical table 
     */
    currentClassMethodVariantMaps._prototype.statisticTable = baseClassMethodVariantMaps?._prototype?.statisticTable || new Map();
    currentClassMethodVariantMaps.static.statisticTable = baseClassMethodVariantMaps?.static?.statisticTable || new Map();

    if (isFirstClass(_class)) {

        currentClassMethodVariantMaps._prototype.mappingTable = new Map();
        currentClassMethodVariantMaps.static.mappingTable = new Map();

        return;
    }
    /**
     * will optimize the following lines
     */

    // console.log(currentClassMethodVariantMaps._prototype === baseClassMethodVariantMaps._prototype)
    currentClassMethodVariantMaps._prototype.mappingTable = new Map(Array.from(baseClassMethodVariantMaps._prototype.mappingTable.entries()));
    currentClassMethodVariantMaps.static.mappingTable = new Map(Array.from(baseClassMethodVariantMaps.static.mappingTable.entries()));
}

function show(_class) {

    const baseClass = Object.getPrototypeOf(_class);
    const baseTypeMeta = metaOf(baseClass);

    /**@type {method_variant_map_metadata_t} */
    const baseClassMethodVariantMaps = baseTypeMeta?.methodVariantMaps;
    const currentClassMeta = metaOf(_class);
    const currentClassMethodVariantMaps = currentClassMeta?.methodVariantMaps;

    console.log(['---'], baseClass?.name, baseClassMethodVariantMaps?._prototype)
    console.log(['---'], _class.name, currentClassMethodVariantMaps?._prototype)
}

function checkAndReAssignMetaWrapper(_class) {

    const typeMeta = metaOf(_class);

    if (typeof typeMeta.loopback === 'object') {

        return;
    }
    /**
     * when metadata_t.loopback is undefined,
     * it means the the metadata_t object belongs to 
     * base class. Therefore, the metadata wrapper of 
     * the current class also belongs to base class
     * and the current clas is undecorated class.
     */
    const baseClassWrapper = wrapperOf(_class);

    Object.defineProperty(_class, METADATA, {
        writable: false,
        value: Object.setPrototypeOf({}, baseClassWrapper)
    })

    refreshTypeMetaObjectForDecoratorMetadata(_class[METADATA], typeMeta);
}

/**
 * This function is used by decorator for the addInitializer()
 * when the decorator know and understand it's class and typeMeta placemnet.
 * 
 * @param {Function} _class
 * @param {metadata_t} _typeMeta 
 */
function assignAbstractToTypeMeta(_class, _typeMeta) {
    
    if (typeof _typeMeta.loopback !== 'object') {

        return;
    } 
    
    _typeMeta.abstract = _class;
    delete _typeMeta.loopback;
}

/**
 * This function is used by decorator for the addInitializer()
 * when the decorator know and understand it's class and typeMeta placemnet.
 * 
 * @param {Function} _class
 * @param {metadata_t} _typeMeta 
 */
function resolveTypeMetaResolution(_class) {

    recursiveResolveResolution(_class);
}

/**
 * Independent propMeta is property_metadata_t object
 * that a class inherited from it base class but the current
 * class override that property without any decorations.
 * 
 * @param {Function} _class 
 */
function unlinkIndependentPropeMeta(_class) {

    scanAndResolveStaticProperties(_class);
    scanAndResolvePrototypeProperties(_class);
}

function scanAndResolveStaticProperties(_class) {

    const meta = metaOf(_class);
    manipulateProperties(_class, meta);
}

function scanAndResolvePrototypeProperties(_class) {

    const meta = metaOf(_class)?._prototype;
    manipulateProperties(_class.prototype, meta);
}

/**
 * 
 * @param {Function} _class 
 * @param {metadata_t | prototype_metadata_t} meta 
 */
function manipulateProperties(_target, meta) {

    const properties = meta.properties;
    const propertyResolutionPlugins = require('./resolutionPlugins/propertyResolutionPlugins');

    for (const [propName, propMeta] of Object.entries(properties) || []) {

        if (
            //!isMethodOverridedWithoutDecorattion.call(_target, propName, propMeta) &&
            //!isAttributeOverridedWithoutDecoration.call(
            isAttributeOverridedWithoutDecoration.call(
                _target, 
                propName, 
                propMeta,
                meta.constructor === metadata_t ? meta : meta.owner.typeMeta
            )
        ) {
            delete properties[propName];
            //continue;
        }

        // unlink the propMeta
        // delete properties[propName];

        for (const plugin of propertyResolutionPlugins || []) {
            
            plugin.call(_target, propName, propMeta);
        }
    }
}

/**
 * 
 * @param {string|symbol} propName 
 * @param {property_metadata_t} propMeta 
 * @param {metadata_t} referencTypeMeta 
 * 
 * @this Function|Object
 * 
 * @returns 
 */
function isAttributeOverridedWithoutDecoration(propName, propMeta, referencTypeMeta) {

    return !propMeta.isMethod &&
            Reflect.ownKeys(this).includes(propName) &&
            propMeta.owner.typeMeta !== referencTypeMeta;
}

/**
 * This method must be bound with the class or the class's
 * prototype object in order to compare private methods.
 * 
 * @param {string|symbol} methodName 
 * @param {property_metadata_t} propMeta 
 * 
 * @this Function|Object is the class or the class's prototype
 * 
 * @returns 
 */
function isMethodOverridedWithoutDecorattion(methodName, propMeta) {

    if (
        !propMeta.isMethod ||
        typeof this[methodName] !== 'function'
    ) {

        return false;
    }

    const ownerPropMetaClass = propMeta.owner?.typeMeta?.abstract;

    return  this !== ownerPropMetaClass &&
            this !== ownerPropMetaClass.prototype &&
            this[methodName] !== getMetadataFootPrintByKey(propMeta, DECORATED_VALUE);
}