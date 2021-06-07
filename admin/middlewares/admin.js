async function admin(req, res, next) {
  try {

    const { data } = await Parse.Cloud.httpRequest({
      url: `http://localhost:${process.env.PORT}${process.env.PARSE_SERVER_MOUNT}/users/me`,
      headers: {
        'X-Parse-Application-Id': process.env.APP_ID,
        'X-Parse-Session-Token': req.session.token
      }
    })

    const user = Parse.Object.fromJSON(data)

    var query = new Parse.Query(Parse.Role)
    query.equalTo('name', 'Admin')
    query.equalTo('users', user)

    const isAdmin = await query.first({ useMasterKey: true })

    if (!isAdmin) {
      throw 'Not Authorized'
    }

    next()

  } catch (error) {
    req.session = null
    res.redirect('/auth')
  }
}

module.exports = admin