const Utils = require('../utils')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

Parse.Cloud.beforeFind('UserPackage', async (req) => {
  const { query, user } = req

  if (user && user.get('type') === 'customer') {
    query.doesNotExist('deletedAt')
  }
})

Parse.Cloud.beforeSave('UserPackage', async (req) => {

  const obj = req.object
  const attrs = obj.attributes

  if (!obj.existed()) {

    if (!req.master) throw 'Not Authorized'

    const acl = new Parse.ACL()
    acl.setPublicReadAccess(false)
    acl.setReadAccess(attrs.user, true)
    acl.setRoleReadAccess('Admin', true)
    acl.setRoleWriteAccess('Admin', true)
    obj.setACL(acl)

    const price = attrs.package.finalPrice

    if (price > 0) {
      obj.set('usage', 0)
      obj.set('status', 'unpaid')
    } else {
      obj.set('usage', 1)
      obj.set('status', 'paid')
    }
  }

  if (obj.dirtyKeys().includes('usage')) {

    const limit = attrs.package.listingLimit

    obj.set('isLimitReached', false)

    if (limit) {
      const diff = limit - obj.get('usage')

      if (diff === 0) {
        obj.set('isLimitReached', true)
      }
    }
  }

})

Parse.Cloud.define('getUserPackages', async (req) => {

  const { params, user } = req

  const isAdmin = await Utils.isAdmin(user)
  if (!isAdmin && !req.master) throw 'Not Authorized'

  const query = new Parse.Query('UserPackage')

  if (params && params.canonical) {
    query.contains('canonical', params.canonical)
  }

  if (params && params.status) {
    query.equalTo('status', params.status)
  }

  if (params && params.user) {
    query.equalTo('user', params.user)
  }

  if (params && params.limit && params.page) {
    query.limit(params.limit)
    query.skip((params.page * params.limit) - params.limit)
  }

  if (params && params.orderBy === 'asc') {
    query.ascending(params.orderByField)
  } else if (params && params.orderBy === 'desc') {
    query.descending(params.orderByField)
  } else {
    query.descending('createdAt')
  }

  query.doesNotExist('deletedAt')
  query.include('user')

  return await query.find({
    useMasterKey: true
  })
})

Parse.Cloud.define('createStripePaymentIntent', async (req) => {

  const userPackageId = req.params.userPackageId
  const placeId = req.params.placeId
  const user = req.user

  if (!user && !req.master) throw 'Not Authorized'

  const place = new Parse.Object('Place')
  place.id = placeId

  await place.fetch({ useMasterKey: true })

  const query = new Parse.Query('UserPackage')
  const userPackage = await query.get(userPackageId, {
    useMasterKey: true
  })

  if (userPackage.get('status') !== 'unpaid') {
    throw new Parse.Error(1, 'Cannot paid')
  }

  let finalPrice = userPackage.get('package').finalPrice

  let amount = finalPrice * 100

  if (Utils.isZeroDecimalCurrency(process.env.CURRENCY)) {
    amount = finalPrice;
  }

  let chargeDescription = __('CHARGE_DESCRIPTION')
  chargeDescription = chargeDescription.replace('%PACKAGE%', userPackage.get('package').name)
  chargeDescription = chargeDescription.replace('%LISTING%', place.get('title'))
  chargeDescription = chargeDescription.replace('%USER%', user.get('name'))

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    description: chargeDescription,
    currency: process.env.CURRENCY.toLowerCase(),
    metadata: {
      user_package_id: userPackage.id,
      place_id: placeId,
      user_id: user.id,
    }
  })

  return paymentIntent.client_secret
})

Parse.Cloud.define('createUserPackage', async (req) => {

  const { user, params } = req

  if (!user) throw 'Not Authorized'

  const queryPackage = new Parse.Query('Package')
  queryPackage.equalTo('objectId', params.packageId)
  const fetchedPackage = await queryPackage.first({ useMasterKey: true })

  if (!fetchedPackage) throw 'Package not found'

  const userPackage = new Parse.Object('UserPackage')
  userPackage.set('user', user)
  userPackage.set('package', fetchedPackage.toJSON())
  
  return await userPackage.save(null, { useMasterKey: true })
})