class MetadataType {

    static get INTERFACE() {

        return 0;
    }

    static get CLASS() {

        return 1;
    }

    static get INSTANCE() {

        return 2;
    }
}

module.exports = new Proxy(MetadataType, {
    construct(target) {

        throw new Error('instantiate an Enum is not allowed');
    }
})