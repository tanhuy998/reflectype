class ArgumentsNotMatchError extends TypeError {

    constructor() {

        super('The arguments passed to function is not match the expected type');
    }
}

module.exports = ArgumentsNotMatchError;