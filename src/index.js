const self = require('./utils/self.js');

module.exports = {
    ...require('./decorators'), 
    ...require('./type'), 
    ...require('./interface'),
    METHOD: require('./libs/methodOverloading/constant.js').METHOD,
    self,
};