// module.exports = {
//     MONGODB_URI:procces.env.MONGODB_URI,
//     SESSION_SECRET:procces.env.SESSION_SECRET,
//     SEND_GRID_API_KEY:procces.env.SEND_GRID_API_KEY,
//     subjectEmail:procces.env.subjectEmail,
//     BASE_URL:procces.env.BASE_URL
// }

if (procces.env.NODE_ENV === 'production') {
    module.exports = require('./keys.prod')
}else {
    module.exports = require('./keys.dev')    
}