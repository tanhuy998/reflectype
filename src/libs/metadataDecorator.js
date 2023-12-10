const GlobalMetadataType = require("./globalMetadataType");

const obj = module.exports = {
    /**
     * 
     * @returns {Object}
     */
    current() {

        const stackLength = this.stack.length;

        if (stackLength === 0) {

            return undefined;
        }

        return this.stack[stackLength -1];
    },
    /**
     * 
     * @returns {Object}
     */
    push() {

        const newWrapper = {};

        this.stack.push(newWrapper);

        return newWrapper;
    },
    /**
     * 
     * @returns {Object}
     */
    pop() {

        return this.stack.pop();
    }
};

Object.defineProperty(
    obj,
    'stack',
    {
        value: [],
        writable: false,
        configurable: false
    }
)

Object.defineProperty(
    obj,
    'type',
    {
        value: typeof Symbol.metadata === 'symbol' ? GlobalMetadataType.OFFICIAL : GlobalMetadataType.VIRTUAL,
        configurable: false,
        writable: false
    }
)