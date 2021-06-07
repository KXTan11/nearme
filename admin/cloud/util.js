Parse.Cloud.define('getHomePageData', async (req) => {

  const { params } = req

  if ((!params.latitude || !params.longitude || !params.unit)) {
    throw 'Missing params'
  }

  const point = new Parse.GeoPoint({
    latitude: params.latitude,
    longitude: params.longitude,
  })

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

  // Categories

  const query1 = new Parse.Query('Category')
  query1.ascending('sort')
  query1.limit(12)
  query1.equalTo('isFeatured', true)
  query1.doesNotExist('deletedAt')
  query1.equalTo('status', 'Active')

  // Featured places 

  const query2 = new Parse.Query('Place')
  query2.equalTo('status', 'Approved')
  query2.equalTo('isFeatured', true)
  query2.doesNotExist('deletedAt')
  query2.include('categories')
  query2.limit(12)

  if (searchRadius) {
    if (params.unit === 'km') {
      query2.withinKilometers('location', point, searchRadius / 1000)
    } else if (params.unit == 'mi') {
      query2.withinMiles('location', point, searchRadius / 1609)
    }
  }

  // Recent places 

  const query3 = new Parse.Query('Place')
  query3.equalTo('status', 'Approved')
  query3.doesNotExist('deletedAt')
  query3.include('categories')
  query3.limit(12)
  query3.descending('createdAt')

  if (searchRadius) {
    if (params.unit === 'km') {
      query3.withinKilometers('location', point, searchRadius / 1000)
    } else if (params.unit == 'mi') {
      query3.withinMiles('location', point, searchRadius / 1609)
    }
  }

  // Slider Data 

  const query4 = new Parse.Query('SliderImage')
  query4.equalTo('isActive', true)
  query4.ascending('sort')
  query4.include('place', 'post', 'category')

  // Nearby places 

  const queryNearby = new Parse.Query('Place')
  queryNearby.equalTo('status', 'Approved')
  queryNearby.doesNotExist('deletedAt')
  queryNearby.include('categories')
  queryNearby.limit(12)

  if (searchRadius) {
    if (params.unit === 'km') {
      queryNearby.withinKilometers('location', point, searchRadius / 1000, true)
    } else if (params.unit == 'mi') {
      queryNearby.withinMiles('location', point, searchRadius / 1609, true)
    }
  } else {
    queryNearby.near('location', point)
  }

  const results = await Promise.all([
    query1.find(),
    query2.find(),
    query3.find(),
    query4.find(),
    queryNearby.find(),
  ])

  const shuffle = (arr) => {
    return arr.map((a) => [Math.random(), a]).sort((a, b) => a[0] - b[0]).map((a) => a[1]);
  }

  return {
    categories: results[0],
    featuredPlaces: shuffle(results[1]),
    newPlaces: shuffle(results[2]),
    nearbyPlaces: results[4],
    slides: results[3]
  }

})