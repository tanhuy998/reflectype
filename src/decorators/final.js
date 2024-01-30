const { markAsDecorator } = require("../utils/decorator/general");
const propertyDecorator = require("../libs/propertyDecorator");
const { setDecoratorFootPrint } = require("../libs/footPrint");
const { IS_FINAL } = require("../libs/keyword/constant");

markAsDecorator(final);

module.exports = final

function final(_, context) {

    const {kind} = context;

    switch(kind) {
        case 'method': {
            propertyDecorator.initMetadata(...arguments);
            setDecoratorFootPrint(_, context, IS_FINAL);
        }
        default:
            break;
    }
}