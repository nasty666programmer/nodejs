const {Schema,model} = require('mongoose');

const sessionsSchema = Schema({
    _id:String,
    expires:Date,
    session:Object
})


module.exports = model('Sessions',sessionsSchema)