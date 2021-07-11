const express = require('express');
const exphbs = require('express-handlebars');
const flash = require('connect-flash')
const Handlebars = require('handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const addCourse = require('./router/add');
const courseAll = require('./router/courseAll');
const card = require('./router/card')
const path = require('path');
const csrf = require('csurf');
const compression = require('compression');
const fs = require('fs');
const helmet = require('helmet')
const mongoose = require('mongoose');
const orders = require('./router/orders');
const auth = require('./router/auth');
const session = require('express-session')
const MongoStore = require('connect-mongodb-session')(session)
const varMiddleware = require('./middleware/variables');
const userMiddleware = require('./middleware/user');
const userOnline = require('./router/usersOnline')
const keys = require('./keys');
const errorHandler = require('./middleware/error');
const profile = require('./router/profile');
const fileMiddleware = require('./middleware/file')

const  PORT = process.env.PORT || 8080



const app = express();


const hbs = exphbs.create({
    defaultLayout:'main',
    extname:'hbs',
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    helpers:require('./utils/hbs-helpers')

})

const store = new MongoStore({
    collection: 'sessions',
    uri:keys.MONGODB_URI,
})



// const password = 'yDShtMPBH5QKgJHp';

app.engine('hbs',hbs.engine);
app.set('view engine','hbs')
app.set('views','views');
app.use(express.urlencoded({extended:true}))

app.use(session({
    secret:keys.SESSION_SECRET,
    resave:false,
    saveUninitialized:false,
    store
}))

app.use(fileMiddleware.single('avatar'))

app.use(csrf())
app.use(flash())
app.use(helmet())
app.use(compression())

app.use(varMiddleware)
app.use(userMiddleware)

app.use(addCourse)
app.use(courseAll);
app.use('/card',card)
app.use('/orders',orders)
app.use('/auth',auth)
app.use('/online',userOnline);
app.use('/profile',profile)



app.use(express.static(path.join(__dirname,'public')))
app.use('/images',express.static(path.join(__dirname,'images')))


app.get('/',(req,res) => {
    res.render('index');
})

app.get('/about',(req,res) => {
    res.render('about')
})


app.get('/add-course',(req,res) => {
    res.render('add-course')
   
})

app.use(errorHandler)

async function start() {

    try {
    await mongoose.connect(keys.MONGODB_URI,{
        useNewUrlParser:true,
        useFindAndModify:false
    })
   
    app.listen(PORT, () => {
        console.log(`server has been run in port: ${PORT}`)
    })
    }catch(err) {
        console.log(err)
    }
}
start();

