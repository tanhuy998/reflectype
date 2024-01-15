const { metaOf, function_metadata_t, metadata_t } = require("../reflection/metadata");
const self = require("../utils/self");
const { REGEX_ES6_CLASS_DETECT, REGEX_ES6_CONSTRUCTOR_DETECT, REGEX_FUNCTION_DETECT, REGEX_PARAM_SEPERATOR } = require("./constant");
const { isInstantiable } = require("./type")

const FUNCTION_PARAMS = 2;
const ES6_PARAMS = 1;

module.exports = {
    initConstructorMetadata
}

function initConstructorMetadata(_, decoratorContext) {

    const {addInitializer} = decoratorContext;

    addInitializer(discoverClassConstructor);
}

function discoverClassConstructor() {

    /**@type {Function} */
    const abstract = isInstantiable(this) ? this : self(this);

    if (typeof abstract !== 'function') {

        return;
    }

    /**@type {metadata_t} */
    const typeMeta = metaOf(abstract);

    if (!(typeMeta instanceof metadata_t)) {

        return;
    }

    if (typeMeta._constructor instanceof function_metadata_t) {

        return;
    }

    const constructorMeta = typeMeta._constructor = new function_metadata_t();
    const str_abstract = abstract.toString();
    const isES6 = str_abstract.match(REGEX_ES6_CLASS_DETECT);
    const match = isES6 ? 
                str_abstract.match(REGEX_ES6_CONSTRUCTOR_DETECT)
                : str_abstract.match(REGEX_FUNCTION_DETECT);
    console.log(match)
    if (!match) {

        return;
    }

    const param_matchGroup = isES6 ? match[ES6_PARAMS] : match[FUNCTION_PARAMS];

    constructorMeta.paramsName = param_matchGroup?.split(REGEX_PARAM_SEPERATOR) ?? [];
}