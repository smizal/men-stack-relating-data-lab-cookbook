const passUserToView = (req, res, next) => {
  res.locals.user = req.session.user ? req.session.user : null
  res.locals.message = req.session.message ? req.session.message : null
  next()
}

module.exports = passUserToView
