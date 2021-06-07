function permission(permission) {
  return function (req, res, next) {

    const user = res.locals.user

    if (user.type === 'super_admin' ||
      (user.type === 'admin' && Array.isArray(user.permissions) &&
        user.permissions.indexOf(permission) !== -1)) {
      next()
    } else {
      res.redirect('/admin/not-authorized')
    }

  }
}

module.exports = permission