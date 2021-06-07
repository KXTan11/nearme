module.exports = async (req, res, next) => {

    try {

        const query = new Parse.Query(Parse.Role)
        query.equalTo('name', 'Admin')
        const adminRole = await query.first({ useMasterKey: true })

        if (!adminRole) {
            throw new Parse.Error(5000, 'Admin Role not found')
        }

        const relation = adminRole.relation('users')
        const count = await relation.query().count({ useMasterKey: true })

        if (count === 0) {
            next()
        } else {
            req.session = null
            res.redirect('/auth')
        }

    } catch (error) {
        if (error.code === 5000) {
            next()
        } else {
            req.session = null
            res.redirect('/auth')
        }
    }

}