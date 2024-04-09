const { function_variant_param_node_metadata_t, function_metadata_t, metadata_t } = require("../../../reflection/metadata");

/**@type {Map<Function, Number>} */
const STATISTIC_TABLE = new Map();

const FUNC_TRIE = new function_variant_param_node_metadata_t();

/**@type {Map<string|symbol, Set<function_metadata_t>>} */
const FUNC_NAMES = new Map();
/**@type {Map<metadata_t, function_metadata_t>}*/
const V_TABLE = new Map();

/**@type {Map<string|symbol, function_metadata_t>} */
const REGISTRY = new Map();

const FUNC_CACHE = new function_variant_param_node_metadata_t

module.exports = {
    FUNC_CACHE,
    FUNC_TRIE, 
    FUNC_NAMES, 
    V_TABLE, 
    STATISTIC_TABLE
}