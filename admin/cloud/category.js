const sharp = require('sharp')
const slug = require('limax')

Parse.Cloud.beforeSave('Category', async (req) => {

  const obj = req.object
  const attrs = obj.attributes
  const user = req.user

  if (!user && !req.master) throw 'Not Authorized'

  if (user) {
    const query = new Parse.Query(Parse.Role)
    query.equalTo('name', 'Admin')
    query.equalTo('users', user)

    const adminRole = await query.first({ useMasterKey: true })

    if (!adminRole) throw 'Not Authorized'
  }

  if (!attrs.image) throw 'The field Image is required'

  if (!obj.existed()) {
    const acl = new Parse.ACL()
    acl.setPublicReadAccess(true)
    acl.setRoleWriteAccess('Admin', true)
    obj.setACL(acl)
    obj.set('placeCount', 0)
  }

  if (obj.dirty('title') && attrs.title) {
    obj.set('canonical', attrs.title.toLowerCase())
  }

  obj.set('slug', slug(attrs.title))

  if (!obj.dirty('image')) return

  const res = await Parse.Cloud.httpRequest({
    url: attrs.image.url()
  })

  const imageResizedData = await sharp(res.buffer)
    .jpeg({ quality: 70, progressive: true })
    .resize(1200)
    .toBuffer()

  const imageThumbData = await sharp(res.buffer)
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
})

Parse.Cloud.beforeDelete('Category', async (req) => {

  const obj = req.object

  const query = new Parse.Query('Place')
  query.equalTo('category', obj)
  const result = await query.first()

  if (result) throw 'Can\'t delete category if it still has places'

})