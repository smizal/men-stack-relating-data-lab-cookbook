const express = require('express')
const router = express.Router()
const User = require('../models/user.js')
const Ingredient = require('../models/ingredient.js')
const Recipe = require('../models/recipe.js')

router.get('/', async (req, res) => {
  try {
    const currentUser = await User.findById(req.session.user._id)
    req.session.message = {
      msg: `Welcome home ... ${req.session.user.username}`,
      color: 'green'
    }
    res.render('foods/index.ejs', {
      pantries: currentUser.pantry
    })
  } catch (err) {
    console.log(err.message)
    req.session.message = { msg: err.message, color: 'red' }
    res.render('error.ejs')
  }
})

router.get('/new', async (req, res) => {
  res.render('foods/new.ejs')
})

router.post('/', async (req, res) => {
  try {
    const currentUser = await User.findById(req.session.user._id)
    currentUser.pantry.push(req.body)
    await currentUser.save()
    req.session.message = { msg: 'Food added successfully', color: 'green' }
    res.redirect(`/users/${currentUser._id}/foods`)
  } catch (err) {
    console.log(err.message)
    req.session.message = { msg: err.message, color: 'red' }
    res.render('error.ejs')
  }
})

router.delete('/:itemId', async (req, res) => {
  try {
    const currentUser = await User.findById(req.session.user._id)
    currentUser.pantry.id(req.params.itemId).deleteOne()
    await currentUser.save()
    res.redirect(`/users/${currentUser._id}/foods`)
    req.session.message = { msg: 'Food Deleted Successfully', color: 'green' }
  } catch (err) {
    console.log(err.message)
    req.session.message = { msg: err.message, color: 'red' }
    res.render('error.ejs')
  }
})

router.get('/:itemId/edit', async (req, res) => {
  try {
    const currentUser = await User.findById(req.session.user._id)
    const pantry = currentUser.pantry.id(req.params.itemId)
    res.render('foods/edit.ejs', {
      pantry: pantry
    })
  } catch (err) {
    req.session.message = { msg: err.message, color: 'red' }
    res.render('error.ejs')
  }
})

router.put('/:itemId', async (req, res) => {
  try {
    const currentUser = await User.findById(req.session.user._id)
    const pantry = currentUser.pantry.id(req.params.itemId)
    pantry.set(req.body)
    await currentUser.save()
    res.redirect(`/users/${currentUser._id}/foods`)
  } catch (err) {
    req.session.message = { msg: err.message, color: 'red' }
    res.render('error.ejs')
  }
})

module.exports = router
