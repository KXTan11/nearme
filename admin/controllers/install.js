const express = require('express')
const install = require('../middlewares/install')

const router = express.Router()

router.get('/', install, (req, res) => {
  res.render('install')
})

router.post('/', install, async (req, res) => {

  const name = req.body.name.trim()
  const username = req.body.username.toLowerCase().trim()
  const email = req.body.email.toLowerCase().trim()
  const password = req.body.password.trim()
  const passwordConfirmation = req.body.passwordConfirmation.trim()

  if (!name) {
    return res.render('install', {
      flash: 'Name is required',
      input: req.body
    })
  }

  if (!username) {
    return res.render('install', {
      flash: 'Username is required',
      input: req.body
    })
  }

  if (!email) {
    return res.render('install', {
      flash: 'Email is required',
      input: req.body
    })
  }

  if (password !== passwordConfirmation) {
    return res.render('install', {
      flash: "Password doesn't match",
      input: req.body
    })
  }

  if (password.length < 6) {
    return res.render('install', {
      flash: 'Password should be at least 6 characters',
      input: req.body
    })
  }

  try {


    const query = new Parse.Query(Parse.Role)
    const roles = await query.find()

    await Parse.Object.destroyAll(roles, {
      useMasterKey: true
    })

    const classes = [
      'Place',
      'Category',
      'Post',
      'Notification',
      'Review',
      'SliderImage',
      'AppConfig',
      'Page',
      'SlideIntro',
      'Report',
      'Package',
      'UserPackage',
    ]

    const schemas = classes.map(clazz => new Parse.Schema(clazz))

    for (const schema of schemas) {
      await schema.save(null, { useMasterKey: true })
    }

    const user = new Parse.User()
    user.set('name', name)
    user.set('username', username)
    user.set('email', email)
    user.set('password', password)
    user.set('type', 'super_admin')

    const acl = new Parse.ACL()
    acl.setPublicReadAccess(true)
    acl.setPublicWriteAccess(false)
    user.setACL(acl)

    await user.signUp()

    const roleACL = new Parse.ACL()
    roleACL.setPublicReadAccess(false)

    const role = new Parse.Role('Admin', roleACL)
    role.relation('users').add(user)

    await role.save()

    req.session.user = user.toJSON()
    req.session.token = user.getSessionToken()
    res.redirect('/admin')

  } catch (error) {
    res.render('install', {
      flash: error.message,
      input: req.body
    })
  }

})

module.exports = router