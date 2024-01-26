const { METADATA } = require("../../constants");
const { metadata_t, metaOf, prototype_metadata_t, property_metadata_t, wrapperOf } = require("../../reflection/metadata");
const { DECORATED_VALUE } = require("../constant");
const { getMetadataFootPrintByKey } = require("../footPrint");
const { isFirstClass } = require("../type");
const { refreshTypeMetaObjectForDecoratorMetadata } = require("./metadataTrace");

const RESOLVED_CLASSES = new Set();

module.exports = {
    resolveTypeMetaResolution,
    recursiveResolveResolution,
};

function recursiveResolveResolution(_class) {

    if (isFirstClass(_class)) {

        return;
    }

    console.log('-----------------------------')
    const stack = [];
    //_class = _class.__proto__;
    let limit = undefined;

    const limits = [];

    while (
        _class !== Function.__proto__ &&
        !RESOLVED_CLASSES.has(_class)
    ) {
        
        stack.push(_class);
        _class = _class.__proto__;

        const HEAD = stack.length - 1;

        if (
            limit !== HEAD &&
            _class !== Function.__proto__ &&
            wrapperOf(stack[HEAD]) !== wrapperOf(_class)
        ) {
            //console.log(HEAD, stack[HEAD]?.name)
            limit = HEAD;
            limits.push(limit);
        }
    }
    console.log([], limits)

    limit = limits.pop();

    while (limit) {

        manipulateMetaDependentClasses(stack, limit)

        limit = limits.pop();
    }
}

function manipulateMetaDependentClasses(stack = [], limit) {

    const HEAD = stack.length - 1;
    let CUR = HEAD;
    console.log([2])
    while (
        CUR >= 0 &&
        CUR > limit &&
        stack.length > 0
    ) { 
        const currentClass = stack[CUR];
        const currentClassMetaWrapper = wrapperOf(currentClass);
        
        /**
         * The class at HEAD of the stack at the moment that this function is called 
         * is determined as the origin metadata declaration until limit.
         */
        if (CUR !== HEAD) {
            
            const wrapper = currentClass[METADATA] = Object.setPrototypeOf({}, currentClassMetaWrapper);
            refreshTypeMetaObjectForDecoratorMetadata(wrapper);
        }

        unlinkIndependentPropeMeta(currentClass);
        
        --CUR;
        stack.pop();
    }
}

/**
 * This function is used by decorator for the addInitializer()
 * when the decorator know and understand it's class and typeMeta placemnet.
 * 
 * @param {Function} _class
 * @param {metadata_t} _typeMeta 
 */
function resolveTypeMetaResolution(_class) {

    // if (typeof _typeMeta.loopback !== 'object') {

    //     return;
    // } 
    
    // _typeMeta.abstract = _class;
    // delete _typeMeta.loopback;

    // scanAndResolveStaticProperties(_class);
    // scanAndResolvePrototypeProperties(_class);

    recursiveResolveResolution(_class);
}

function unlinkIndependentPropeMeta(_class) {

    scanAndResolveStaticProperties(_class);
    scanAndResolvePrototypeProperties(_class);

    RESOLVED_CLASSES.add(_class);
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

    for (const [propName, propMeta] of Object.entries(properties) || []) {
        
        if (isMethodOverridenWithoutDecorattion.call(_target, propName, propMeta)) {
            // unlink the propMeta
            delete properties[propName];
        }
    }
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
function isMethodOverridenWithoutDecorattion(methodName, propMeta) {

    if (!propMeta.isMethod) {

        return false;
    }
    
    if (typeof this[methodName] !== 'function') {

        return false;
    }

    const ownerPropMetaClass = propMeta.owner?.typeMeta?.abstract;

    return  this !== ownerPropMetaClass &&
            this !== ownerPropMetaClass.prototype &&
            this[methodName] !== getMetadataFootPrintByKey(propMeta, DECORATED_VALUE);
}