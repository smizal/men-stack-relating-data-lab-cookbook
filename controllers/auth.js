const express = require('express')
const router = express.Router()
const User = require('../models/user.js')
const bcrypt = require('bcrypt')

router.get('/sign-up', (req, res) => {
  res.render('auth/sign-up.ejs')
})

router.post('/sign-up', async (req, res) => {
  try {
    // First, get the user from the database
    const userInDatabase = await User.findOne({ username: req.body.username })

    // Check if there is existing user with same username !
    if (userInDatabase) {
      return res.send('Username already taken.')
    }

    // Check if the passwords are same
    if (req.body.password !== req.body.confirmPassword) {
      return res.send('Password and Confirm Password must match')
    }

    // Encrypt the password
    const hashedPassword = bcrypt.hashSync(req.body.password, 10)
    req.body.password = hashedPassword

    // Save the user data in database
    const user = await User.create(req.body)
    req.session.user = {
      username: user.username,
      _id: user._id
    }
    req.session.message = { msg: 'User signed-up successfully', color: 'green' }
    req.session.save(() => {
      res.redirect('/')
    })
  } catch (err) {
    req.session.message = { msg: err.message, color: 'red' }
    res.render('error.ejs')
  }
})

router.get('/sign-in', (req, res) => {
  res.render('auth/sign-in.ejs')
})

router.post('/sign-in', async (req, res) => {
  try {
    // First, get the user from the database
    const userInDatabase = await User.findOne({ username: req.body.username })
    if (!userInDatabase) {
      return res.send('Login failed. Please try again.')
    }

    // Check if the password is correct, compare them
    const validPassword = bcrypt.compareSync(
      req.body.password,
      userInDatabase.password
    )
    if (!validPassword) {
      return res.send('Login failed. Please try again.')
    }

    // Save any required data in session
    req.session.user = {
      username: userInDatabase.username,
      _id: userInDatabase._id
    }
    req.session.message = { msg: 'User logged in successfully', color: 'green' }
    req.session.save(() => {
      res.redirect('/')
    })
  } catch (err) {
    req.session.message = { msg: err.message, color: 'red' }
    res.render('error.ejs')
  }
})

router.get('/sign-out', (req, res) => {
  try {
    req.session.destroy(() => {
      res.redirect('/')
    })
  } catch (err) {
    req.session.message = { msg: err.message, color: 'red' }
    res.render('error.ejs')
  }
})

module.exports = router
