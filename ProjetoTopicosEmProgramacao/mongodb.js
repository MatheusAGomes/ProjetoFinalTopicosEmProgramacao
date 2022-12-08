const mongoose = require('mongoose')

async function startDB(){
    await mongoose.connect('mongodb+srv://matheusgomes:123@cluster0.k3m2ny1.mongodb.net/test')
}
module.exports = startDB;