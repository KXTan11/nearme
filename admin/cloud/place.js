const sharp = require('sharp')
const slug = require('limax')
const Place = require('../models/place')
const MailgunHelper = require('../helpers/mailgun').MailgunHelper
const Mailgen = require('mailgen')
const moment = require('moment')

Parse.Cloud.define('createPlace', async (req) => {

  const { user, params } = req

  if (!user) throw 'Not Authorized'

  let userPackage = null

  const queryConfig = new Parse.Query('AppConfig')

  const config = await queryConfig.first({
    useMasterKey: true
  })

  if (config) {

    const placeConfig = config.get('places')

    if (placeConfig && placeConfig.enablePaidListings) {

      const queryPackage = new Parse.Query('Package')
      queryPackage.equalTo('objectId', params.packageId)
      const fetchedPackage = await queryPackage.first({ useMasterKey: true })

      const queryUserPackage = new Parse.Query('UserPackage')
      queryUserPackage.equalTo('objectId', params.packageId)
      const fetchedUserPackage = await queryUserPackage.first({
        useMasterKey: true
      })

      if (fetchedPackage) {

        // Verify multiple purchases

        if (fetchedPackage.get('disableMultiplePurchases')) {

          const queryUserPackageCount = new Parse.Query('UserPackage')
          queryUserPackageCount.equalTo('package.objectId', fetchedPackage.id)
          const count = await queryUserPackageCount.count({
            useMasterKey: true
          })

          if (count) {
            throw new Parse.Error(5000, 'Cannot purchase this package multiple times')
          }
        }

        userPackage = new Parse.Object('UserPackage')
        userPackage.set('user', user)
        userPackage.set('package', fetchedPackage.toJSON())
        await userPackage.save(null, { useMasterKey: true })

      } else if (fetchedUserPackage) {

        userPackage = fetchedUserPackage

        // check limit usage


        if (userPackage.get('isLimitReached')) {
          throw new Parse.Error(5001, 'Usage limit reached')
        }

        if (userPackage.get('status') === 'unpaid') {
          throw new Parse.Error(5002, 'Unpaid package')
        }

        userPackage.increment('usage', 1)

        await userPackage.save(null, {
          useMasterKey: true
        })

      } else {
        throw 'Package not found'
      }

    }

  }

  const place = new Parse.Object('Place')
  place.set('title', params.title)
  place.set('categories', [params.category])
  place.set('description', params.description)

  const location = new Parse.GeoPoint(
    params.location.lat,
    params.location.lng,
  )
  place.set('location', location)

  place.set('address', params.address)
  place.set('image', params.image)
  place.set('website', params.website)
  place.set('phone', params.phone)
  place.set('userPackage', userPackage)
  place.set('user', user)

  if (config) {

    const placeConfig = config.get('places')

    if (placeConfig && placeConfig.autoApprove) {
      place.set('status', 'Approved')
    }
  }

  if (userPackage) {

    const package = userPackage.get('package')

    if (userPackage.get('status') === 'paid') {

      if (package.autoApproveListing) {
        place.set('status', 'Approved')
      }

      if (package.markListingAsFeatured) {
        place.set('isFeatured', true)
      }

      if (package.listingDuration) {

        const expiresAt = moment()
          .add(package.listingDuration, 'days')
          .startOf('day')
          .toDate()

        place.set('expiresAt', expiresAt)
      }
    }

  }

  await place.save(null, {
    useMasterKey: true
  })

  return { place, userPackage }
})

Parse.Cloud.define('getRandomPlaces', async (req) => {

  const { latitude, longitude, unit } = req.params

  if ((!latitude || !longitude || !unit)) {
    throw 'Missing params'
  }

  const queryAppConfig = new Parse.Query('AppConfig')
  const appConfig = await queryAppConfig.first({
    useMasterKey: true
  })

  let searchRadius = 0

  if (appConfig) {
    const placeSettings = appConfig.get('places')

    if (placeSettings) {
      searchRadius = placeSettings.searchRadius
    }
  }

  const pipeline = []

  if (searchRadius) {
    pipeline.push({
      geoNear: {
        near: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        maxDistance: searchRadius,
        key: 'location',
        spherical: true,
        distanceField: 'dist',
        query: {
          status: 'Approved',
        }
      }
    })

    pipeline.push({
      sample: {
        size: 15
      }
    })

  } else {

    pipeline.push({
      match: {
        status: 'Approved',
      },
    })

    pipeline.push({
      sample: {
        size: 15
      }
    })
  }



  const query = new Parse.Query('Place')

  const results = await query.aggregate(pipeline)

  const ids = results.map(result => result.objectId)

  const query1 = new Parse.Query('Place')
  query1.containedIn('objectId', ids)
  query1.include('categories')


  return await query1.find()

})

Parse.Cloud.define('getPlaces', async (req) => {

  const { params } = req

  const page = params.page || 0
  const limit = params.limit || 100
  const status = params.status || 'Approved'
  const maxDistance = params.maxDistance

  const queryAppConfig = new Parse.Query('AppConfig')
  const appConfig = await queryAppConfig.first({
    useMasterKey: true
  })

  let searchRadius = 0

  if (appConfig) {
    const placeSettings = appConfig.get('places')

    if (placeSettings) {
      searchRadius = placeSettings.searchRadius
    }

    if (maxDistance && maxDistance <= searchRadius) {
      searchRadius = maxDistance
    }
  }

  const queries = []

  if (params.tag) {

    const searchQuery = params.tag.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

    const queryTag = new Parse.Query('Place')
    queryTag.contains('tags', searchQuery)
    queries.push(queryTag)

    const queryCanonical = new Parse.Query('Place')
    queryCanonical.contains('canonical', searchQuery)
    queries.push(queryCanonical)
  }

  let query = new Parse.Query('Place')

  if (queries.length) {
    query = Parse.Query.or(...queries)
  }

  if (Array.isArray(status)) {
    query.containedIn('status', status)
  } else {
    query.equalTo('status', status)
  }

  if (params.ratingMin) {
    query.greaterThanOrEqualTo('ratingAvg', Number(params.ratingMin))
  }

  if (params.ratingMax) {
    query.lessThanOrEqualTo('ratingAvg', Number(params.ratingMax))
  }

  if (params.cat) {

    if (Array.isArray(params.cat)) {

      const categories = params.cat.map(id => {
        const obj = new Parse.Object('Category')
        obj.id = id
        return obj
      })

      if (categories.length) {
        query.containedIn('categories', categories)
      }

    } else if (typeof params.cat === 'string') {
      const category = new Parse.Object('Category')
      category.id = params.cat
      query.equalTo('categories', category)
    }

  }

  if (Array.isArray(params.bounds) && params.bounds.length) {

    const southwest = new Parse.GeoPoint(
      params.bounds[0].latitude,
      params.bounds[0].longitude
    );

    const northeast = new Parse.GeoPoint(
      params.bounds[1].latitude,
      params.bounds[1].longitude
    );

    query.withinGeoBox('location', southwest, northeast)

  } else if (params.latitude && params.longitude) {

    const point = new Parse.GeoPoint({
      latitude: params.latitude,
      longitude: params.longitude,
    })

    const sorted = (params.nearby === '1' || params.sortByField === 'location') ? true : false;

    if (params.unit === 'km' && searchRadius) {
      query.withinKilometers('location', point, searchRadius / 1000, sorted)
    } else if (params.unit == 'mi' && searchRadius) {
      query.withinMiles('location', point, searchRadius / 1609, sorted)
    } else {
      query.near('location', point)
    }

  }

  if (params.sortBy && params.sortByField !== 'location') {
    if (params.sortBy === 'asc') {
      query.ascending(params.sortByField)
    } else if (params.sortBy === 'desc') {
      query.descending(params.sortByField)
    }
  } else if (params.nearby !== '1' && params.sortByField !== 'location') {
    query.descending('createdAt')
  }

  query.doesNotExist('deletedAt')

  if (params.count) {
    return await query.count()
  }

  query.include('categories')

  let featuredPlaces = []

  const shuffle = (arr) => {
    return arr.map((a) => [Math.random(), a]).sort((a, b) => a[0] - b[0]).map((a) => a[1]);
  }

  if (params.page === 0 && params.featured !== '1') {

    const featuredQuery = Parse.Query.fromJSON('Place', query.toJSON())
    featuredQuery.equalTo('isFeatured', true)

    featuredPlaces = await featuredQuery.find()

    if (!params.nearby) {
      featuredPlaces = shuffle(featuredPlaces)
    }

  }

  if (params.featured === '1') {
    query.equalTo('isFeatured', true)
  } else {
    query.equalTo('isFeatured', false)
  }

  if (params.user) {
    query.equalTo('user', params.user)
  }

  if (params.category) {
    query.equalTo('categories', params.category)
  }

  query.skip(page * limit)
  query.limit(limit)

  let places = await query.find()

  return [...featuredPlaces, ...places]

})

Parse.Cloud.define('isPlaceStarred', async (req) => {

  const user = req.user
  const placeId = req.params.placeId

  if (!user) throw 'Not Authorized'

  const objPlace = new Parse.Object('Place')
  objPlace.id = placeId

  const query = new Parse.Query('Review')
  query.equalTo('place', objPlace)
  query.equalTo('user', user)

  const review = await query.first()
  const isStarred = review ? true : false
  return isStarred
})

Parse.Cloud.define('isPlaceLiked', async (req) => {

  const user = req.user
  const placeId = req.params.placeId

  if (!user) throw 'Not Authorized'

  const query = new Parse.Query('Place')
  query.equalTo('likes', user)
  query.equalTo('objectId', placeId)

  const place = await query.first()
  const isLiked = place ? true : false
  return isLiked

})

Parse.Cloud.define('likePlace', async (req) => {

  const user = req.user
  const placeId = req.params.placeId

  if (!user) throw 'Not Authorized'

  const query = new Parse.Query('Place')
  const place = await query.get(placeId)

  if (!place) throw ('Record not found')

  const query1 = new Parse.Query('Place')
  query1.equalTo('likes', user)
  query1.equalTo('objectId', placeId)
  const isLiked = await query1.first()

  const relation = place.relation('likes')

  let response

  if (isLiked) {
    place.increment('likeCount', -1)
    relation.remove(user)
    response = false
  } else {
    place.increment('likeCount', 1)
    relation.add(user)
    response = true
  }

  await place.save(null, {
    useMasterKey: true
  })

  return response

})

Parse.Cloud.beforeSave('Place', async (req) => {

  const obj = req.object
  const attrs = obj.attributes
  const user = req.user

  if (!user && !req.master) throw 'Not Authorized'

  const canonical = attrs.title.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  obj.set('canonical', canonical)
  obj.set('slug', slug(attrs.title))

  if (!obj.existed()) {
    const acl = new Parse.ACL()
    acl.setPublicReadAccess(true)
    acl.setRoleWriteAccess('Admin', true)
    obj.setACL(acl)
    obj.set('status', attrs.status || 'Pending')
    obj.set('user', attrs.user || user)
    obj.set('ratingAvg', 0)
    obj.set('isFeatured', attrs.isFeatured || false)
  }

  const promises = []

  if (obj.get('image') && obj.dirty('image')) {

    const url = obj.get('image').url()

    const promise = Parse.Cloud.httpRequest({
      url: url
    }).then(httpResponse => {
      return sharp(httpResponse.buffer)
        .jpeg({ quality: 70, progressive: true })
        .resize(1200)
        .toBuffer()
    }).then(imageData => {
      return new Parse.File('image.jpg', {
        base64: imageData.toString('base64')
      }).save()
    }).then(savedFile => {
      obj.set('image', savedFile)
    })

    promises.push(promise)

    const promiseThumb = Parse.Cloud.httpRequest({
      url: url
    }).then(httpResponse => {
      return sharp(httpResponse.buffer)
        .jpeg({ quality: 70, progressive: true })
        .resize(480, 480)
        .toBuffer()
    }).then(imageData => {
      return new Parse.File('image.jpg', {
        base64: imageData.toString('base64')
      }).save()
    }).then(savedFile => {
      obj.set('imageThumb', savedFile)
    })

    promises.push(promiseThumb)
  }

  await Promise.all(promises)

  // Resize gallery images

  if (obj.dirtyKeys().includes('images')) {

    const resizedImages = []

    for (let image of attrs.images) {

      const { buffer } = await Parse.Cloud.httpRequest({
        url: image.url()
      })

      const imageData = await sharp(buffer)
        .jpeg({ quality: 70, progressive: true })
        .resize(1200)
        .toBuffer()

      const file = new Parse.File('photo.jpg', {
        base64: imageData.toString('base64')
      })

      await file.save()

      resizedImages.push(file)
    }

    obj.set('images', resizedImages)
  }

  if (typeof attrs.images === 'undefined') {
    obj.set('images', [])
  }

})

Parse.Cloud.afterSave('Place', async (req) => {

  const user = req.user
  const obj = req.object
  const attrs = obj.attributes

  // Send email notification to admin of new places

  if (!obj.existed()) {

    try {

      const query = new Parse.Query(Parse.Role)
      query.equalTo('name', 'Admin')
      query.equalTo('users', attrs.user)

      const isAdmin = await query.first({ useMasterKey: true })

      if (!isAdmin) {

        const queryConfig = new Parse.Query('AppConfig')

        const config = await queryConfig.first({
          useMasterKey: true
        })

        const emailConfig = config.get('email')

        const toAddress = emailConfig.addressForNotifications

        await attrs.user.fetch()

        let body = __('EMAIL_BODY_NEW_PLACE')
        body = body.replace('%PLACE_NAME%', attrs.title)
        body = body.replace('%PLACE_DESCRIPTION%', attrs.description || '---')
        body = body.replace('%USER_NAME%', `${attrs.user.get('name')} (${attrs.user.get('username')})`)
        body = body.replace(/\n/g, '<br />');

        const apiKey = process.env.GOOGLE_MAPS_API_KEY

        const src = `https://maps.googleapis.com/maps/api/staticmap?key=${apiKey}
      &markers=color:0xff7676%7C${attrs.location.latitude},${attrs.location.longitude}
      &zoom=17&format=png&size=640x220&scale=2`

        const map = `<img style="max-width:100%;height:auto;display:block;border-radius:16px" src="${src}" />`

        const email = {
          body: {
            title: __('EMAIL_TITLE_NEW_PLACE'),
            intro: [body, map],
            action: {
              instructions: '',
              button: {
                text: __('EMAIL_BUTTON_TEXT_NEW_PLACE'),
                link: process.env.PUBLIC_SERVER_URL + '/admin/places'
              }
            },
            signature: false,
          }
        }

        const mailgunHelper = new MailgunHelper({
          apiKey: process.env.MAILGUN_API_KEY,
          domain: process.env.MAILGUN_DOMAIN,
          host: process.env.MAILGUN_HOST,
        })

        const mailGenerator = new Mailgen({
          theme: 'default',
          product: {
            name: process.env.APP_NAME,
            link: process.env.MAILGUN_PUBLIC_LINK,
            copyright: __('EMAIL_COPYRIGHT')
          }
        })

        mailgunHelper.send({
          subject: __('EMAIL_SUBJECT_NEW_PLACE'),
          from: process.env.MAILGUN_FROM_ADDRESS,
          to: toAddress,
          html: mailGenerator.generate(email),
        })

      }

    } catch (error) {
      console.log(error)
    }

  }

})

Parse.Cloud.afterDelete('Place', async (req) => {

  const obj = req.object
  const attrs = obj.attributes

  // Recalculate place count.

  try {

    const category = attrs.category

    const query1 = new Parse.Query(Place)
    query1.equalTo('status', 'Approved')
    query1.equalTo('category', category)
    query1.doesNotExist('deletedAt')

    const count1 = await query1.count()

    category.set('placeCount', count1)
    await category.save(null, { useMasterKey: true })

  } catch (error) {
    console.log(error.message)
  }

  try {

    const query = new Parse.Query('Review')
    query.equalTo('place', obj)
    const count = await query.count()
    query.limit(count)
    const results = await query.find()
    await Parse.Object.destroyAll(results, {
      useMasterKey: true
    })

  } catch (err) {
    console.warn(err.message)
  }

})

// Cloud function to add the ratingAvg field to all places.
// This new field is used to filter places by rating.
// To run it just login into the Parse Dashboard (/dashboard)
// then click Jobs, locate the job named 'addRatingAvgFieldToPlaces'
// and click Run now. Run this job only if you are upgrading
// from a older version than v6.0.

Parse.Cloud.job('addRatingAvgFieldToPlaces', async (req) => {

  const { message } = req

  const start = new Date()

  const query = new Parse.Query('Place')

  const res = query.each(async place => {

    const total = place.get('ratingTotal')
    const count = place.get('ratingCount')

    if (total && count) {
      const ratingAvg = Math.round(total / count)
      place.set('ratingAvg', ratingAvg)
    } else {
      place.set('ratingAvg', 0)
    }

    return place.save(null, { useMasterKey: true })

  }, {
    useMasterKey: true
  })

  const end = new Date()

  const diff = end.getTime() - start.getTime()

  message(`job took ${diff / 1000}s to finish`)

  return res
})

Parse.Cloud.define('addSearchIndex', async () => {
  const schema = new Parse.Schema('Place')

  schema.addIndex('search_index', {
    tags: "text",
    canonical: "text"
  })

  return schema.update({ useMasterKey: true })
})

Parse.Cloud.job('addGeoIndex', async (req) => {

  const { message } = req

  message(`Job started at ${new Date().toISOString()}`)

  try {
    const schema = new Parse.Schema('Place')

    schema.addIndex('geo_index', {
      location: '2dsphere'
    })

    await schema.update({ useMasterKey: true })

    message(`Job finished at ${new Date().toISOString()}`)

  } catch (error) {
    message(error.message)
  }

})

Parse.Cloud.job('migratePlaceCategories', async (req) => {

  const { message } = req

  message(`Job started at ${new Date().toISOString()}`)

  try {

    const query = new Parse.Query('Place')

    await query.each(place => {
      const category = place.get('category')

      if (category && typeof place.get('categories') === 'undefined') {
        place.set('categories', [category])
      }

      if (place.dirty()) {
        return place.save(null, { useMasterKey: true })
      }

    }, { useMasterKey: true })

    message(`Job finished at ${new Date().toISOString()}`)

  } catch (error) {
    message(error.message)
  }

})

Parse.Cloud.job('SetPlaceIsFeaturedDefaultValue', async (req) => {

  const { message } = req

  message(`Job started at ${new Date().toISOString()}`)

  try {

    const query = new Parse.Query('Place')

    await query.each(place => {

      if (typeof place.get('isFeatured') === 'undefined') {
        place.set('isFeatured', false)
      }

      if (place.dirty()) {
        return place.save(null, { useMasterKey: true })
      }

    }, { useMasterKey: true })

    message(`Job finished at ${new Date().toISOString()}`)

  } catch (error) {
    message(error.message)
  }

})