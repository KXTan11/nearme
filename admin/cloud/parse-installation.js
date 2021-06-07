Parse.Cloud.beforeSave(Parse.Installation, (req) => {
  const obj = req.object
  if (!obj.existed()) obj.set('isPushEnabled', true)
})