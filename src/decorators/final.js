const { markAsDecorator } = require("../utils/decorator/general");

const { setDecoratorFootPrint, getMetadataFootPrintByKey, setMetadataFootPrint } = require("../libs/footPrint");
const { IS_FINAL } = require("../libs/keyword/constant");
const { initMetadata } = require("../libs/propertyDecorator");
const { OVERRIDE_APPLIED, FINAL_APPLIED } = require("../libs/methodOverloading/constant");
const { getLegacyPropMeta, getLegacyPropMetaOf } = require("../libs/metadata/metadataTrace");
const { DECORATED_VALUE } = require("../libs/constant");

markAsDecorator(final);

module.exports = final

function final(_, context) {

    const {kind} = context;
    
    if (kind !== 'method') {

        throw new Error();
    }

    const propMeta = initMetadata(_, context);
    const funcMeta = propMeta.functionMeta;

    if (funcMeta.isVirtual) {

        throw new ReferenceError('virtual method could not be virtual');
    }

    setMetadataFootPrint(propMeta, FINAL_APPLIED);
    return getMetadataFootPrintByKey(propMeta, DECORATED_VALUE);
}