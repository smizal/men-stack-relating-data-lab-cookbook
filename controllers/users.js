const express = require('express')
const router = express.Router()
const User = require('../models/user.js')
const Ingredient = require('../models/ingredient.js')
const Recipe = require('../models/recipe.js')

router.get('/', async (req, res) => {
  try {
    const allUsersPantries = await User.find({})
    req.session.message = {
      msg: `Welcome home ... ${req.session.user.username}`,
      color: 'green'
    }
    res.render('users/index.ejs', {
      allUsersPantries: allUsersPantries
    })
  } catch (err) {
    console.log(err.message)
    req.session.message = { msg: err.message, color: 'red' }
    res.render('error.ejs')
  }
})

module.exports = router
