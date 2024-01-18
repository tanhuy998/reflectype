module.exports = {
    mapNames
}

function mapNames(declared, defined, placeHolder) {

    let index = 0;

    for (const name of declared || []) {
        
        placeHolder[index++] = defined[name];
        delete defined[name];
    }
    
    mapName_checkUndeclared(defined);

    return placeHolder;
}

function mapName_checkUndeclared(undeclared) {
    
    if (Object.keys(undeclared).length > 0) {
        
        throw {
            error: new ReferenceError('trying to mapp undeclared name'),
            undeclaredName: undeclared[0],
        }
    }
}