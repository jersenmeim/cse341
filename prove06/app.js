const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const error = require('./controller/404');

const User = require('./models/user');
const MONGODB_URL = process.env.MONGODB_URL || "mongodb+srv://jersenmeim:j3rs3nm31m1196@cluster0.qnn4a.mongodb.net/shop";

const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URL,
    collection: 'sessions'
});

const cors = require('cors')
var PORT = process.env.PORT || 3000;


const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const addproduct = require('./routes/add-product-r');
const shoproutes = require('./routes/shop-r');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static(path.join(__dirname, 'public')))

app.use(
    session({
        secret: 'my secret',
        resave: false,
        saveUninitialized: false,
        store: store
    })
);

app.use(csrfProtection);
app.use(flash());


app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});


app.use((req, res, next) => {
    //throw new Error('Sync Dummy');
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        })
        .catch(err => {
            next(new Error(err));
        });
});


app.use(addproduct.routes);
app.use(shoproutes);
app.use(authRoutes);
app.use('/500', error.get500);
app.use(error.get404);

app.use((error, req, res, next) => {
    // res.status(error.httpStatusCode).render(...);
    // res.redirect('/500');
    res.status(500).render('500', {
        pageTitle: 'Error!',
        path: '/500',
        isAuthenticated: req.session.isLoggedIn
    });
});


const corsOptions = {
    origin: "https://ecommerceproveme4.herokuapp.com/",
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));


const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    family: 4
};

mongoose.connect(MONGODB_URL, options).then(result => {

    app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
}).catch(err => {
    console.log(err);
})