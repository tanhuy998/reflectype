const {describe, test, expect} = require('@jest/globals');

const {   
    locateNewFuncVariantTrieNode,
    initOverloadedMethodPropeMeta,
    searchForMethodVariant,
    mergeFuncVariant
} = require('../methodVariant.lib');
const { function_metadata_t, parameter_metadata_t } = require('../../reflection/metadata');

describe('Method overloading',() => {

    
})