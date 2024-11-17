const express = require('express')
const router = express.Router()
const User = require('../models/listing.js')
const Listing = require('../models/listing.js')

router.get('/', async (req, res) => {
  try {
    const populatedListings = await Listing.find({}).populate('owner')
    console.log('Populated Listings:', populatedListings)
    res.render('listings/index.ejs', { listings: populatedListings })
  } catch (err) {
    req.session.message = { msg: err.message, color: 'red' }
    res.render('error.ejs')
  }
})

router.get('/new', async (req, res) => {
  res.render('listings/new.ejs')
})

router.post('/', async (req, res) => {
  try {
    console.log(req.body)
    req.body.owner = req.session.user._id
    console.log(req.session.user._id)
    const created = await Listing.create(req.body)
    console.log(created)
    req.session.message = { msg: 'Listing added successfully', color: 'green' }
    res.redirect('/listings')
  } catch (err) {
    req.session.message = { msg: err.message, color: 'red' }
    res.render('error.ejs')
  }
})

router.get('/:listingId', async (req, res) => {
  try {
    const populatedListings = await Listing.findById(
      req.params.listingId
    ).populate('owner')
    const userHasFavorited = populatedListings.favoritedByUsers.some((user) =>
      user.equals(req.session.user._id)
    )

    res.render('listings/show.ejs', {
      listing: populatedListings,
      userHasFavorited: userHasFavorited
    })
  } catch (err) {
    req.session.message = { msg: err.message, color: 'red' }
    res.render('error.ejs')
  }
})

router.delete('/:listingId', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.listingId)
    if (listing.owner.equals(req.session.user._id)) {
      await listing.deleteOne()
      req.session.message = { msg: 'List deleted successfully', color: 'green' }
      res.redirect('/listings')
    } else {
      res.send("You don't have permission to do that.")
    }
  } catch (err) {
    req.session.message = { msg: err.message, color: 'red' }
    res.render('error.ejs')
  }
})

router.get('/:listingId/edit', async (req, res) => {
  try {
    const currentListing = await Listing.findById(req.params.listingId)
    if (currentListing.owner.equals(req.session.user._id)) {
      res.render('listings/edit.ejs', {
        listing: currentListing
      })
    } else {
      res.send("You don't have permission to do that.")
    }
  } catch (err) {
    req.session.message = { msg: err.message, color: 'red' }
    res.render('error.ejs')
  }
})

router.put('/:listingId', async (req, res) => {
  try {
    const currentListing = await Listing.findById(req.params.listingId)
    if (currentListing.owner.equals(req.session.user._id)) {
      await currentListing.updateOne(req.body)
      req.session.message = {
        msg: 'Listing updated successfully',
        color: 'green'
      }
      res.redirect('/listings')
    } else {
      res.send("You don't have permission to do that.")
    }
  } catch (err) {
    req.session.message = { msg: err.message, color: 'red' }
    res.render('error.ejs')
  }
})

router.post('/:listingId/favorited-by/:userId', async (req, res) => {
  try {
    await Listing.findByIdAndUpdate(req.params.listingId, {
      $push: { favoritedByUsers: req.params.userId }
    })
    res.redirect(`/listings/${req.params.listingId}`)
  } catch (err) {
    req.session.message = { msg: err.message, color: 'red' }
    res.render('error.ejs')
  }
})

router.delete('/:listingId/favorited-by/:userId', async (req, res) => {
  try {
    await Listing.findByIdAndUpdate(req.params.listingId, {
      $pull: { favoritedByUsers: req.params.userId }
    })
    res.redirect(`/listings/${req.params.listingId}`)
  } catch (err) {
    req.session.message = { msg: err.message, color: 'red' }
    res.render('error.ejs')
  }
})

module.exports = router
