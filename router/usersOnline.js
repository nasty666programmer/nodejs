const {Router} = require('express');
const router = Router();
const sessionsSchema = require('../models/sessions');


const filterItems = (data) => {
    // console.log({data})
var ss = {}
let t = [] ;
    return data.map((el,i) => ({
        ...el.session.user
        // console.log(ss)
    }))
    // console.log(dt)
}

router.get('/users',async (req,res) => {
    let sessionAll = await sessionsSchema.find()
    // console.log(sessionAll)
    const items = filterItems(sessionAll) 
    console.log(items)
res.render('users-online',{
    items
})
})


module.exports = router;