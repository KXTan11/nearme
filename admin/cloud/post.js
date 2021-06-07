const sharp = require('sharp')
const slug = require('limax')

Parse.Cloud.beforeFind('Post', async (req) => {
  const { query, user, master } = req

  if ((!user && !master) || (user && user.get('type') === 'customer')) {
    query.equalTo('status', 'Active')
  }
})

Parse.Cloud.beforeSave('Post', async (req) => {

  const obj = req.object
  const attrs = obj.attributes
  const user = req.user

  if (!user && !req.master) throw 'Not Authorized'

  if (!req.master) {
    const query = new Parse.Query(Parse.Role)
    query.equalTo('name', 'Admin')
    query.equalTo('users', user)

    const adminRole = await query.first({ useMasterKey: true })

    if (!adminRole) throw 'Not Authorized'
  }

  if (!obj.existed()) {
    const acl = new Parse.ACL()
    acl.setPublicReadAccess(true)
    acl.setRoleWriteAccess('Admin', true)
    obj.setACL(acl)
  }

  if (obj.dirty('title')) {
    obj.set('canonical', attrs.title.toLowerCase())
  }

  obj.set('slug', slug(attrs.title))

  if (attrs.image && obj.dirty('image')) {

    const httpResponse = await Parse.Cloud.httpRequest({
      url: attrs.image.url()
    })

    const imageResizedData = await sharp(httpResponse.buffer)
      .jpeg({ quality: 70, progressive: true })
      .resize(1200)
      .toBuffer()

    const imageThumbData = await sharp(httpResponse.buffer)
      .jpeg({ quality: 70, progressive: true })
      .resize(200, 200)
      .toBuffer()

    const file = new Parse.File('image.jpg', {
      base64: imageResizedData.toString('base64')
    })

    const thumb = new Parse.File('image.jpg', {
      base64: imageThumbData.toString('base64')
    })

    await file.save()
    await thumb.save()

    obj.set('image', file)
    obj.set('imageThumb', thumb)

  }
})

Parse.Cloud.afterSave('Post', (req) => {

  const obj = req.object
  const attrs = obj.attributes
  const originalAttrs = req.original ? req.original.attributes : {}

  if (
    (!obj.existed() && attrs.isPushEnabled && attrs.status === 'Active') ||
    (obj.existed() && attrs.status === 'Active' && originalAttrs.status === 'Pending')) {

    const query = new Parse.Query(Parse.Installation)
    query.containedIn('deviceType', ['ios', 'android'])
    query.equalTo('isPushEnabled', true)

    const params = {
      where: query,
      data: {
        alert: attrs.title,
        sound: 'default',
        badge: 'Increment'
      }
    }

    Parse.Push.send(params, {
      useMasterKey: true
    })
  }

})