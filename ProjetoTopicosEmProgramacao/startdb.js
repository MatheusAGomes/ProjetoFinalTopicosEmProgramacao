const startdb = require('./mongodb')

class Loaders{
    start(){
        startdb();
    }
}

module.exports = new Loaders();