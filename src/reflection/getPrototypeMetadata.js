const getMetadata = require('./getMetadata.js');

function getPrototypeMetadata(_abstract) {

    const classMeta = getMetadata(_abstract);

    return classMeta?.prototype;
}

module.exports = getPrototypeMetadata;