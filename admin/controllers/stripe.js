const express = require('express')
const bodyParser = require('body-parser')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const moment = require('moment')

const router = express.Router()

router.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {

  let data = {}
  let eventType = ''

  if (process.env.STRIPE_WEBHOOK_SECRET) {

    let event = {}
    let signature = req.headers['stripe-signature']

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }
    data = event.data
    eventType = event.type
  } else {
    // Webhook signing is recommended, but if the secret is not configured,
    // we can retrieve the event data directly from the request body.
    data = req.body.data
    eventType = req.body.type
  }

  if (eventType === 'payment_intent.succeeded') {

    try {
      const charge = data.object.charges.data[0]
      const userPackageId = data.object.metadata.user_package_id
      const placeId = data.object.metadata.place_id

      const queryUserPackage = new Parse.Query('UserPackage')
      const userPackage = await queryUserPackage.get(userPackageId, {
        useMasterKey: true
      })

      const queryPlace = new Parse.Query('Place')
      const place = await queryPlace.get(placeId, {
        useMasterKey: true
      })

      const package = userPackage.get('package')

      if (package.autoApproveListing) {
        place.set('status', 'Approved')
      }

      if (package.markListingAsFeatured || package.type == 'promote_listing') {
        place.set('isFeatured', true)
      }

      if (package.listingDuration) {

        const expiresAt = moment().utc()
          .add(package.listingDuration, 'days')
          .startOf('day')
          .toDate()

        if (package.type === 'paid_listing') {
          place.set('expiresAt', expiresAt)
        } else if (package.type === 'promote_listing') {
          place.set('featuredExpiresAt', expiresAt)
        }
        
      }

      await place.save(null, { useMasterKey: true })

      userPackage.set('status', 'paid')
      userPackage.set('charge', charge)
      userPackage.increment('usage', 1)

      await userPackage.save(null, { useMasterKey: true })

    } catch (error) {
      return res.status(400).send(`Webhook Error: ${error.message}`)
    }

    res.json({ received: true })
  }
})

module.exports = router