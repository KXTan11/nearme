function Utils() { }

Utils.isAdmin = function (user) {
  const query = new Parse.Query(Parse.Role)
  query.equalTo('name', 'Admin')
  query.equalTo('users', user)
  return query.first({
    useMasterKey: true
  })
};

Utils.formatCurrency = function (value) {
  return value.toLocaleString(process.env.CURRENCY_LOCALE, {
    style: 'currency',
    currency: process.env.CURRENCY,
    currencyDisplay: process.env.CURRENCY_DISPLAY
  })
}

Utils.isZeroDecimalCurrency = function (currency) {
  const zeroDecimalCurrencies = [
    'BIF', 'DJF', 'JPY', 'KRW', 'PYG', 'VND', 'XAF',
    'XPF', 'CLP', 'GNF', 'KMF', 'MGA', 'RWF', 'VUV', 'XOF'
  ];
  return zeroDecimalCurrencies.includes(currency)
}

Utils.getConfig = async function () {
  const query = new Parse.Query('AppConfig')
  return await query.first({
    useMasterKey: true
  })
};

Utils.roundNumber = function (number) {
  return Math.round(number * 100) / 100
}

module.exports = Utils;