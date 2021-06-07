const express = require('express')

const router = express.Router()

router.get('/verifyEmailSuccess', (req, res) => {
  
  const title = __('TITLE_EMAIL_VERIFIED')
  const body = __('BODY_EMAIL_VERIFIED')
  const image = '/images/success.svg'
  
  res.render('custom', {
    title: title,
    body: body,
    image: image,
    layout: false
  })
})

router.get('/passwordResetSuccess', (req, res) => {
  
  const title = __('TITLE_PASSWORD_RESET_SUCCESS')
  const body = __('BODY_PASSWORD_RESET_SUCCESS')
  const image = '/images/success.svg'
  
  res.render('custom', {
    title: title,
    body: body,
    image: image,
    layout: false
  })
})

router.get('/invalidLink', (req, res) => {
  
  const title = __('TITLE_INVALID_LINK')
  const body = __('BODY_INVALID_LINK')
  const image = '/images/error.svg'
  
  res.render('custom', {
    title: title,
    body: body,
    image: image,
    layout: false
  })
})

router.get('/choosePassword', (req, res) => {
  res.render('choose-password', {
    layout: false
  })
})

module.exports = router