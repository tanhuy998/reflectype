const self = require('./utils/self.js');

module.exports = {
    ...require('./decorators'), 
    ...require('./type'), 
    ...require('./interface'),
    self,
};