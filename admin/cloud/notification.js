Parse.Cloud.beforeSave('Notification', async (req) => {

  const obj = req.object
  const user = req.user

  if (!user && !req.master) throw 'Not Authorized'

  const query = new Parse.Query(Parse.Role)
  query.equalTo('name', 'Admin')
  query.equalTo('users', user)

  const adminRole = await query.first({ useMasterKey: true })

  if (!adminRole) throw 'Not Authorized'

  if (!obj.existed()) {
    const acl = new Parse.ACL()
    acl.setPublicReadAccess(true)
    acl.setRoleWriteAccess('Admin', true)
    obj.setACL(acl)
  }

})

Parse.Cloud.afterSave('Notification', async (req) => {

  const obj = req.object
  const attrs = obj.attributes

  if (!obj.existed()) {

    const query = new Parse.Query(Parse.Installation)
    query.containedIn('deviceType', ['ios', 'android'])
    query.equalTo('isPushEnabled', true)

    const users = attrs.users

    if (Array.isArray(users) && users.length) {
      query.containedIn('user', users)
    }

    if (attrs.type === 'Geo') {

      const southwest = new Parse.GeoPoint(
        attrs.bounds.south,
        attrs.bounds.west
      );

      const northeast = new Parse.GeoPoint(
        attrs.bounds.north,
        attrs.bounds.east
      );

      query.withinGeoBox('location', southwest, northeast)
    }

    const pushParams = {
      where: query,
      data: {
        alert: attrs.message,
        sound: 'default',
        badge: 'Increment'
      }
    }

    if (attrs.place) {
      pushParams.data.placeId = attrs.place.id
    } else if (attrs.post) {
      pushParams.data.postId = attrs.post.id
    } else if (attrs.category) {
      pushParams.data.categoryId = attrs.category.id
    }

    await Parse.Push.send(pushParams, {
      useMasterKey: true
    })
  }

})