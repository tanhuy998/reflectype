const { TYPE_JS } = require("../../constants");
const { METADATA, metadata_t, property_metadata_t } = require("../../reflection/metadata");
const { FOOTPRINT, DECORATED_VALUE } = require("../constant");
const { isFunctionOrFail, isObjectOrFail, isObjectLike, isObject, isValuable, isObjectKey, isObjectKeyOrFail } = require("../type");
const { UPDATE } = require("./constant");

module.exports = class PropertyDecoratorFootPrint {

    static retrieveFootPrintObject(_, context) {

        if (!isObjectLike(_)) {

            return undefined;
        }

        const {kind} = context;
        let decoratorTarget;

        if (kind === 'accessor') {

            decoratorTarget = _.get;
        }
        else if 
        (['method', 'getter', 'setter']
        .includes(kind)) {

            decoratorTarget = _;
        }
        else {

            return undefined;
        }
        
        const {metadata, name} = context;
        const targetMeta = decoratorTarget[METADATA];

        const typeMeta = metadata[TYPE_JS];
        const propMeta = typeMeta?.properties[name];

        if (!isObject(targetMeta) ||
        !(propMeta instanceof property_metadata_t) ||
        propMeta[FOOTPRINT] !== targetMeta[FOOTPRINT]) {

            return undefined;
        }

        return propMeta[FOOTPRINT];
    }

    static hasFootPrint(_, context, _key = undefined) {

        const footPrintObject = this.retrieveFootPrintObject(_, context);

        if (!isObject(footPrintObject)) {

            return false;
        }

        if (!isValuable(_key)) {

            return true;
        }

        return isValuable(footPrintObject[_key]);
    }

    static retrieveFootPrintValue(_, context, _key) {

        if (!isObjectKey(_key)) {

            throw new TypeError('_key must be type of either string or symbol');
        }

        const footPrintObject = this.retrieveFootPrintObject(_, context, _key);

        if (!isObject(footPrintObject)) {

            return undefined;
        }

        return footPrintObject[_key];
    }

    #decoratorTarget;
    #decoratorContext;


    #footPrint;

    get decoratedValue() {

        return this.get(DECORATED_VALUE);
    }

    get decoratorTarget() {

        return this.#decoratorTarget;
    }

    get decoratorContext() {

        return this.#decoratorContext;
    }

    get hasFootPrint() {

        return typeof this.#footPrint === 'object';
    }

    get footPrintObject() {

        return this.#footPrint;
    }

    constructor(_, decoraotorContext) {

        this.#decoratorTarget = _;
        this.#decoratorContext = decoraotorContext;

        this.#init();
    }

    #init() {

        const target = this.#decoratorTarget;
        const context = this.#decoratorContext;
        const footPrintObject = DecoratorFootPrint
                                .retrieveFootPrintObject(target, context);

        this.#footPrint = footPrintObject;
    }

    #initializeFootPrint() {

        if (this.hasFootPrint) {

            throw new Error();
        }

        const {name, metadata} = this.#decoratorContext;
        const typeMeta = metadata[TYPE_JS];
        const propMeta = typeMeta?.properties[name];

        if (!(propMeta instanceof property_metadata_t)) {

            throw new Error('');
        }

        propMeta[FOOTPRINT] = {};

        this[UPDATE]();
    }

    [UPDATE]() {


    }

    has(_key) {

        if (!isObjectKey(_key)) {

            throw new TypeError();
        }

        return isValuable(this.get(_key));
    }

    set(_key, _value = true) {

        if (!this.hasFootPrint) {

            this.#initializeFootPrint();
        }

        this.#footPrint[_key] = _value;

        this[UPDATE]();
    }

    get(_key) {

        isObjectKeyOrFail(_key);

        if (!this.hasFootPrint) {

            return undefined;
        }

        return this.#footPrint[_key];
    }

    setDecoratedValue(_value) {

        this.set(DECORATED_VALUE, _value);
    }
}