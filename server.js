const dotenv = require('dotenv').config()
const express = require('express')
const app = express()

const mongoose = require('mongoose')
const methodOverride = require('method-override')
const morgan = require('morgan')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const isSignedIn = require('./middleware/is-signed-in.js')
const passUserToView = require('./middleware/pass-user-to-view.js')

const port = process.env.PORT ? process.env.PORT : 3000
const path = require('path')

// listing controllers
const authController = require('./controllers/auth.js')
const foodsController = require('./controllers/foods.js')
const usersController = require('./controllers/users.js')

mongoose.connect(process.env.MONGO_DB)

mongoose.connection.on('connected', () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}`)
})

// Middleware to parse URL-encoded data from forms
app.use(express.urlencoded({ extended: false }))

// Middleware for using HTTP verbs such as PUT or DELETE
app.use(methodOverride('_method'))

// Morgan for logging HTTP requests
app.use(morgan('dev'))

app.use(express.static(path.join(__dirname, 'public')))

// Managing sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_DB
    })
  })
)

// use the local middleware
app.use(passUserToView)

/* app.use((req, res, next) => {
  if (req.session.message) {
    res.locals.message = req.session.message
    req.session.message = null
  }
  next()
}) */

app.get('/', async (req, res) => {
  res.render('index.ejs')
})

app.get('/vip-lounge', isSignedIn, (req, res) => {
  res.send(`Welcome to the party ${req.session.user.username}.`)
})

// use controllers
app.use('/auth', authController)
app.use('/users', isSignedIn, usersController)
app.use('/users/:userId/foods', isSignedIn, foodsController)

app.get('*', function (req, res) {
  res.status(404).render('error.ejs', {
    msg: 'Route not found!'
  })
})

/* app.listen(port, () => {
  console.log(`The Express app is ready on port ${port}`)
}) */

const handleServerError = (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Warning! Port ${port} is already in use!`)
  } else {
    console.log('Error:', err)
  }
}

app
  .listen(port, () => {
    console.log(`The express app is ready on port ${port}!`)
  })
  .on('error', handleServerError)
