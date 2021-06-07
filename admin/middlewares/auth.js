async function auth(req, res, next) {
    
    if (!req.session) return next()

    try {

        await Parse.Cloud.httpRequest({
            url: `http://localhost:${process.env.PORT}${process.env.PARSE_SERVER_MOUNT}/users/me`,
            headers: {
                'X-Parse-Application-Id': process.env.APP_ID,
                'X-Parse-Session-Token': req.session.token
            }
        })

        res.redirect('/admin')

    } catch (error) {
        next()
    }
}

module.exports = auth