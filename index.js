const INTERFACE_PROTOTYPE = Symbol(Date.now());
const IS_CHECKABLE = Symbol(Date.now());
const EXPORT = Symbol(Date.now());

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

class InterfacePrototype {

    #interfaces;
    get list() {
        return this.#interfaces;
    }

    constructor(..._interfaces) {

        this.#interfaces = new Set(_interfaces);
    }
}


class Interface {

    static get PROTOTYPE() {

        return Object.getOwnPropertyNames(this.prototype);
    }
}

class Variable {

    #type;
    #value;
    #name;
    #isClassProperty;
    #isMethod;
    #class;
    #isStatic;

    get type() {

        return this.#type;
    }

    get value() {

        return this.#value;
    }

    constructor(_type, _value, _name, metadata = {class: undefined, isMethod, isStatic}) {

        this.#type = _type;
        this.#value = _value;
        this.#name = _name;
        this.#class = metadata.class;
        this.#isMethod = metadata.isMethod;
        this.#isStatic = metadata.isStatic;

        try {

            preventImmediateValue(this.#type);
        }
        catch (e) {
            
            throw new TypeError();
        }

        //if (this.#value === undefined) return;

        this.check();
    }

    

    setValue(_value) {

        this.#value = _value;

        this.check()
    }

    getValue() {

        return this.#value;
    }

    setClass(_class) {

        this.#class = _class;
    }

    check() {

        if (this.#value === undefined) return;

        const _type = this.#type

        if (this.#value[IS_CHECKABLE]) {

            if (!this.#value.__is(this.#type)) {

                throw new TypeError(`Initial value is not implements or type of ${_type.name}`);
            }
        }
        else {

            if (!(this.#value instanceof _type)) {

                throw new TypeError(`Initial value is not type of ${_type.name}`);
            }
        }
    }
}

function type(_abstract) {

    preventImmediateValue(_abstract);

    const isInterface = _abstract.__proto__ === Interface;

    return function(instance, context) {

        const {kind} = context;

        switch(kind) {

            case 'accessor':
                return handleAccessor(instance, context);
            case 'method':
                return hanldeMethod(instance, context);
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

                return [theFunction, invovable];
            }

            return checkReturnTypeAndResolve(_method, this, arguments);
        }
    }
}



function checkable(_class = undefined) {

     // defines static property 'isCheckable' 
    Object.defineProperty(_class, IS_CHECKABLE, {
        value: true,
        configurable: false,
        enumerable: false,
        writable: false
    })

    Object.defineProperty(_class, '__implemented', {
        configurable: false,
        writable: false,
        enumerable: false,
        value: function(_abstract) {

            //onst isInterface = _abstract.__proto__ === Interface;

            if (!isInterface(_abstract)) {

                throw new Error(`${_abstract.name} is not type of Interface`);
            }
            
            return this[INTERFACE_PROTOTYPE].list.has(_abstract);
        }
    })

    const checkableClass = class extends _class {

        
        constructor() {

            super(...arguments);

            Object.defineProperty(this, '__is', {
                configurable: false,
                writable: false,
                enumerable: false,
                value: function (_abstract) {

                    try {

                        // throw Error when _abstract is not type of Interface
                        return _class.__implemented(_abstract);

                    } catch (e) {

                      return this instanceof _abstract;
                    }
                }
            });

            Object.defineProperty(this, IS_CHECKABLE, {
                value: true,
                configurable: false,
                enumerable: false,
                writable: false
            })
        }
    }

    return checkableClass;
}

function isInterface(_class) {

    return _class.__proto__ === Interface;
} 

function preventImmediateValue(_type) {

    if (typeof _type != 'function') {

        throw new TypeError(`Cannot pass immediate value`);
    }
}

function implement(..._interfaces) {

    return function (_class) {

        _interfaces = _interfaces.map((value) => {

            const transformedInterface = InterfaceCrossMap.getFromMinor(value);

            if (transformedInterface !== undefined) {

                
                return transformedInterface;
            }

            return value;
        })

        if (!_class[INTERFACE_PROTOTYPE]) {

            const interfaceProto = new InterfacePrototype(..._interfaces);

            Object.defineProperty(_class, INTERFACE_PROTOTYPE, {
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
    
                _class[INTERFACE_PROTOTYPE].list.add(intf);
            }
        }


        class InterfaceImplemetedCLass extends _class {

            static #realName = super.name;
            static get realName() {

                return this.#realName;
            }


            
            #realClassName = super.constructor.name;
            get realClassName() {

                return this.#realClassName;
            }
            

            constructor() {

                super(...arguments);

                for (const intf of _interfaces) {

                    //const methods = Object.getOwnPropertyNames(intf.prototype);
                    const methods = intf.PROTOTYPE;

                    for (const method of methods) {
                        
                        if (method == "constructor") continue;

                        if (!this[method]) throw new TypeError(`class ${_class.name} implements ${intf.name} but not defines '${method}' method`);
                    }
                }


                Object.defineProperty(this, INTERFACE_PROTOTYPE, {
                    value: _class[INTERFACE_PROTOTYPE],
                    configurable: false,
                    writable: false,
                    enumerable: false,
                });
            }
        }

        if (!_class[IS_CHECKABLE]) {

            return checkable(InterfaceImplemetedCLass);
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
    Interface, implement, checkable, type, hintable
};