
/**@type {WeakMap<Function, WeakMap<Function, Object>>} */
const CACHE = new WeakMap();
const CACHED_META = Symbol('cached_meta');
const NO_META = Symbol('retrieve_no_meta');

/**
 *  Cache aspect of reflections
 */

module.exports = {
    getCache,
    setCache,
    extract,
    isValidCache
};


function extract(cache) {

    const ret = cache?.[CACHED_META];
    return ret === NO_META ? undefined : ret;
}

function isValidCache(cache) {

    return typeof cache === 'object' &&
            CACHED_META in cache;
}

function getCache(targetClass, reflectionClass, ...reflectionOptions) {

    const reflectionClasseMap = CACHE.get(targetClass);
    
    if (!reflectionClasseMap) {

        return undefined;
    }

    const trieList = reflectionClasseMap.get(reflectionClass);

    if (typeof trieList !== 'object') {

        return undefined;
    }

    const trie = trieList[reflectionOptions.length];
    let ret = trie?.[reflectionOptions.shift()];

    while(reflectionOptions.length) {

        ret = ret?.[reflectionOptions.shift()];
    }
    
    return ret;
}

function setCache(meta, targetClass, reflectionClass, ...reflectionOptions) {
    meta ??= NO_META;
    const reflectionClasseMap = CACHE.get(targetClass) ?? CACHE.set(targetClass, new WeakMap()).get(targetClass);
    /**@type {Object} */
    const trieList = reflectionClasseMap.get(reflectionClass) ?? reflectionClasseMap.set(reflectionClass, {}).get(reflectionClass);
    const trie = trieList[reflectionOptions.length] ?? (trieList[reflectionOptions.length] = {});
    let opt = reflectionOptions.shift();
    let ret = trie[opt] ?? (trie[opt] = {});

    while(reflectionOptions.length) {
        opt = reflectionOptions.shift();
        ret = ret[opt] ?? (ret[opt] = {});
    }

    ret[CACHED_META] = meta;
}

