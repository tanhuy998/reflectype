const wrapper = require('../libs/metadataDecorator.js');
const {METADATA} = require('../constants.js');

function metadata() {

    wrapper[METADATA] = {};

    return function(_class, _context) {

        const {kind} = _context;
    
        if (kind !== 'class') {
    
            throw new Error('@metadata just evaluates metadata on class');
        }
    
        const metadata = wrapper[METADATA];
    
        _class[METADATA] = metadata;
    
        wrapper[METADATA] = undefined;
    
        return _class;
    }
}

module.exports = metadata;