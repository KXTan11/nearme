Parse.Cloud.beforeFind('Package', async (req) => {
  const { query, user, master } = req

  if ((!user && !master) || (user && user.get('type') === 'customer')) {
    query.equalTo('status', 'Active')
    query.doesNotExist('deletedAt')
  }
})

Parse.Cloud.beforeSave('Package', async (req) => {

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

  if (attrs.salePrice === 0) {
    obj.set('finalPrice', 0)
  } else {
    obj.set('finalPrice', attrs.salePrice || attrs.price)
  }

  if (obj.dirty('name')) {
    const canonical = attrs.name.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
    obj.set('canonical', canonical)
  }

})