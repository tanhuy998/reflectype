const InterfacePrototype = require('./interfacePrototype.js');
const Interface = require('./interface.js');
const Variable = require('./variable.js');
const {preventImmediateValue, isInterface} = require('./utils.js');
const {INTERFACE_PROTOTYPE, INTERFACES, REFLECTION, IS_CHECKABLE, EXPORT} = require('./constant.js');


function countFunctionParams(_func) {

    if (typeof _func !== 'function') return 0;

    const detectParamsRegex = /\((.*)\)/;

    const match = _func.toString()
                        .match(detectParamsRegex);

    if (match == null) return 0;

    paramsString = match[1];

    return paramsString.split(',').length;
}

class InterfaceCrossMap {

    static #major = new WeakMap();
    static #minor = new WeakMap();

    static get(_key, map = 'major') {

        switch(map) {
            case 'major':
                return this.#major.get(_key);
            case 'minor':
                return this.#minor.get(_key);
            default:
                return undefined;
        }
    }

    static getFromMajor(_key) {

        return this.get(_key, 'major');
    }

    static getFromMinor(_interface) {
    
        return this.get(_interface, 'minor');
    }

    static map(_major, _minor) {
        
        this.#major.set(_major, _minor);
        this.#minor.set(_minor, _major);

    }
}


class PropertyType {

    static get METHOD() {

        return 0x1
        ;
    }

    static get FIELD() {

        return 0x2;
    }
}
class PropertyReflectionMetadata {

    #type;
    #value;

    setType(type) {

        this.#type = type;
    }

    setValue(value) {

        this.#type = value;
    }

    constructor(context) {

        this.#bindContextArgs(context);
    }

    #bindContextArgs(context) {

        if (!context) return;

        const {kind, name} = context;
    }
}

class ObjectReflection {

    #properties = new Map();
    get properties() {

        return this.#properties;
    }

    constructor() {

    }
}

function type(_abstract) {

    preventImmediateValue(_abstract);

    const isInterface = _abstract.__proto__ === Interface;

    return function(instance, context) {

        return handle(instance, context); 
    }

    function handle(prop, context) {
        const {kind, name} = context;

        if (!this[REFLECTION]) {

            this[REFLECTION] = new ObjectReflection();
        }

        if (this[REFLECTION].properties.has(name)) {

            throw new Error('Type was applied on this property before');
        }

        const propertyReflection = new PropertyReflectionMetadata();

        this[REFLECTION].properties.set(name, propertyReflection);

        switch(kind) {

            case 'accessor':
                propertyReflection.setType(PropertyType.FIELD);
                return handleAccessor(prop, context);
            case 'method':
                propertyReflection.setType(PropertyType.METHOD);
                return hanldeMethod(prop, context);
            default:
                throw new Error('Decorator @type just applied to auto assessor, add \'accessor\' syntax before the class property');
        }
    }

    function handleAccessor(prop, context) {

        const getter = prop.get;
        const setter = prop.set;

        const {static, private, name} = context;

        const variable = new Variable(_abstract, undefined, name, {
            isStatic: static,
            isPrivate: private,
        });

        return {
            get() {

                return variable.getValue();
            },
            set(_value) {

                return variable.setValue(_value);
            },
            init(intiValue) {

                variable.setClass(this.__proto__);

                variable.setValue(intiValue);

                return variable;
            }
        }
    }

    function hanldeMethod(_method, context) {

        function checkReturnTypeAndResolve(target, _this, _args) {

            const result = target.call(_this, ...arguments);

            const matchType = (result[IS_CHECKABLE]) ? result.__is(_abstract) : result instanceof _abstract;

            if (!matchType) {

                throw new TypeError('The return value of function is not match return type');
            }

            return result;
        }

        return function typeHintedFunction(flag) {

            if (flag === EXPORT) {

                const theFunction = _method.bind(this);

                const invovable = new Proxy(theFunction, {
                    apply: checkReturnTypeAndResolve
                })

                return [theFunction, _abstract, invovable];
            }

            return checkReturnTypeAndResolve(_method, this, arguments);
        }
    }
}


function isInterfacePrototypeConflict(_class) {

    /**
     *  _class[INTERFACE_PROTOTYPE] is public static property
     *  Classes that extend other class will inherit that property
     *  we need check for the existence of _class[INTERFACE_PROTOTYPE] 
     *  in order to overload that property
     */

    const interfacePrototype = _class[INTERFACE_PROTOTYPE];

    if (interfacePrototype) {

        // when the existent interface prototype if not the class
        // that mean we need to overload the _class[INTERFACE_PROTOTYPE]
        if (interfacePrototype.origin !== _class) {

            return true;
        }
        else {

            return false;
        }
    }
    else {

        return false;
    }
}


function implement(..._interfaces) {

    function mapInterfaces(interfaces) {

        return interfaces.map((value) => {

            if (!isInterface(value)) {
    
                throw new TypeError(`${intf.name} is not Interface`);
            }

            return crossCheckInterface(value);
        })
    }

    function crossCheckInterface(_interface) {

        const transformedInterface = InterfaceCrossMap.getFromMinor(_interface);

            if (transformedInterface !== undefined) {

                
                return transformedInterface;
            }

            return _interface;
    }

    return function (_class) {

        _interfaces = mapInterfaces(_interfaces);

        //_class = checkable(_class);

        class InterfaceImplemetedCLass extends _class {

            static {

                if (!this[INTERFACE_PROTOTYPE] || isInterfacePrototypeConflict(this)) {

                    /**
                     *  Overload or initialize interface's prototype
                     */
        
                    const interfaceProto = new InterfacePrototype(this, ..._interfaces);
        
                    Object.defineProperty(this, INTERFACE_PROTOTYPE, {
                        configurable: false,
                        writable: false,
                        enumerable: false,
                        value: interfaceProto
                    });
                }
                else {
        
                    for (const intf of _interfaces) {
        
                        preventImmediateValue(intf);
            
                        if (!isInterface(intf)) {
            
                            throw new TypeError(`${intf.name} is not Interface`);
                        }
            
                        this[INTERFACE_PROTOTYPE].list.add(intf);
                    }
                }
        
        
                if (!this[INTERFACES]) {
        
                    Object.defineProperty(this, INTERFACES, {
                        configurable: false,
                        writable: true,
                        enumerable: false,
                        value: new Set(_interfaces)
                    })
                }
                else {
        
                    this[INTERFACES] = new Set([..._interfaces, ..._class[INTERFACES]]);
                }
            }

            static #realName = _class.name;
            static get realName() {

                return _class.name;
            }

            static get [IS_CHECKABLE] () {

                return true;
            }

            static __implemented(_abstract) {

                if (!isInterface(_abstract)) {

                    throw new TypeError(`${_abstract.name} is not type of Interface`);
                }

                return this[INTERFACES].has(_abstract)
            }

            
            #realClassName = super.constructor.name;
            get realClassName() {

                return this.#realClassName;
            }
            
            get [IS_CHECKABLE] () {

                return true;
            }

            get [INTERFACES] () {

                return InterfaceImplemetedCLass[INTERFACES]
            }

            constructor() {

                super(...arguments);

                InterfaceImplemetedCLass[INTERFACE_PROTOTYPE].verify(this);
            }

            __is(_abstract) {

                _abstract = crossCheckInterface(_abstract);

                try {

                    return InterfaceImplemetedCLass.__implemented(_abstract)
                }
                catch (e) {

                    return this instanceof _abstract;
                }
            }
        }

        return InterfaceImplemetedCLass;
    }
}


function hintable(_class, {kind}) {

    if (kind !== 'class') {

        throw new TypeError('decorator @hint just works with class');
    }

    const proxy = new Proxy(_class, {
        apply: function (target, _this, _args) {

            const decorator = type(target);

            return decorator(..._args);
        }
    })

    InterfaceCrossMap.map(_class, proxy);

    return proxy;
}

module.exports = {
    Interface, implement, type, hintable, countFunctionParams, INTERFACES
};