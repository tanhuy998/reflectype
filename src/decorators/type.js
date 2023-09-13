function type(_abstract) {

    preventImmediateValue(_abstract);

    const isInterface = _abstract.__proto__ === Interface;

    return function(instance, context) {

        return handle(instance, context); 
    }

    function handle(prop, context) {
        const {kind, name} = context;

        switch(kind) {

            case 'accessor':
                return handleAccessor(prop, context);
            case 'method':
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

                const currentValue = variable.getValue();

                const notNullAndUndefined = currentValue !== undefined && currentValue !== null;

                const propValue = notNullAndUndefined ? currentValue : variable;

                return new Proxy(propValue, {
                    referenceObj: this,
                    get: function(target, prop) {

                        const propertyMetadata = this.referenceObj[REFLECTION].properties[context.name];

                        if (prop === 'type') {

                            return propertyMetadata.type;
                        }

                        if (target instanceof Variable) {

                            throw new Error(`Property ${prop} is null or undefined`);
                        }

                        return target[prop];
                    }
                });
            },
            set(_value) {

                return variable.setValue(_value);
            },
            init(intiValue) {

                checkIfMetadataIsSetted(this, name);

                this[REFLECTION].setProperty(context);

                this[REFLECTION].properties[context.name].setType(_abstract)
                //this[REFLECTION].typeHintedProperties.get(name).setType(_abstract);

                variable.setClass(_abstract);

                variable.setValue(intiValue);

                return variable;
            }
        }
    }

    function hanldeMethod(_method, context) {

        function checkReturnTypeAndResolve(target, _this, _args) {

            const result = target.call(_this, ..._args);

            const matchType = (result[IS_CHECKABLE]) ? result.__is(_abstract) : result instanceof _abstract;

            if (!matchType) {

                throw new TypeError('The return value of function is not match return type');
            }

            return result;
        }

        // function typeHintedFunction(flag) {

        //     const {name} = context;

        //     //checkIfMetadataIsSetted(this, name);

        //     //this[REFLECTION].typeHintedProperties.get(name).setType(_abstract);

        //     const invocable = new Proxy(theFunction, {
        //         apply: checkReturnTypeAndResolve,
        //     })

        //     if (flag === EXPORT) {

        //         const theFunction = _method.bind(this);

        //         return [theFunction, _abstract, invocable];
        //     }

        //     return checkReturnTypeAndResolve(_method, this, arguments);
        // }

        return new Proxy(_method, {
            referenceObj: this,
            apply: function (target, _this, _args) {

                checkIfMetadataIsSetted(this.referenceObj, context.name);

                const metadata = this.referenceObj[REFLECTION];

                metadata.setProperty(context);

                const propertyMetadata = metadata.properties[context.name];

                if (!propertyMetadata.type) {

                    propertyMetadata.setType(_abstract);
                }

                return checkReturnTypeAndResolve(target, _this, _args)
            },
            get: function (_target, _metadata) {

                checkIfMetadataIsSetted(this.referenceObj, context.name);

                const metadata = this.referenceObj[REFLECTION];

                metadata.setProperty(context);

                const propertyMetadata = metadata.properties[context.name];

                if (!propertyMetadata.type) {

                    propertyMetadata.setType(_abstract);
                }

                switch(_metadata) {
                    case 'returnType':
                        return propertyMetadata.type;
                    case 'parameters':
                        return ;
                    default:
                        break;
                }

                return _target[_metadata];
            },
            set: () => false,
        })
    }

    function checkIfMetadataIsSetted(_object, prop) {

        if (!_object[REFLECTION]) {

            _object[REFLECTION] = new ObjectReflection(_object);
        }   

        const metadata = _object[REFLECTION];

        if (metadata.properties[prop]) {

            throw new Error(`@type is applied to ${prop} multiple times`);
        }
    }
}