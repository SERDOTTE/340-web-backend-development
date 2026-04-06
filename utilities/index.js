const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid = ""
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors"></a>'
      grid += '<div class="namePrice">'
      grid += '<hr>'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Build the inventory detail view HTML
* ************************************ */
Util.buildInventoryDetail = async function (vehicle) {
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(vehicle.inv_price)
  const formattedMiles = new Intl.NumberFormat("en-US").format(vehicle.inv_miles)

  let detail = '<div class="vehicle-detail">'
  detail += '<div class="vehicle-detail__image-wrap">'
  detail += '<img class="vehicle-detail__image" src="' + vehicle.inv_image + '" alt="' + vehicle.inv_make + ' ' + vehicle.inv_model + '">'
  detail += '</div>'
  detail += '<div class="vehicle-detail__content">'
  detail += '<p class="vehicle-detail__headline">' + vehicle.inv_year + ' ' + vehicle.inv_make + ' ' + vehicle.inv_model + '</p>'
  detail += '<p class="vehicle-detail__price">Price: ' + formattedPrice + '</p>'
  detail += '<p><strong>Year:</strong> ' + vehicle.inv_year + '</p>'
  detail += '<p><strong>Make:</strong> ' + vehicle.inv_make + '</p>'
  detail += '<p><strong>Model:</strong> ' + vehicle.inv_model + '</p>'
  detail += '<p><strong>Mileage:</strong> ' + formattedMiles + ' miles</p>'
  detail += '<p><strong>Color:</strong> ' + vehicle.inv_color + '</p>'
  detail += '<p><strong>Description:</strong> ' + vehicle.inv_description + '</p>'
  detail += '</div>'
  detail += '</div>'

  return detail
}

/* ***************************
 * Build classification select list
 * ************************** */
Util.buildClassificationList = async function (classification_id = null) {
  const data = await invModel.getClassifications()
  let classificationList = '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (classification_id != null && row.classification_id == classification_id) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)


/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  res.locals.loggedin = false
  res.locals.accountData = null

  if (req.cookies && req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          res.clearCookie("jwt")
          return next()
        }
        res.locals.accountData = accountData
        res.locals.loggedin = true
        return next()
      }
    )
  } else {
    next()
  }
}

/* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }

/* ****************************************
 *  Check Employee or Admin Authorization
 * ************************************ */
Util.checkEmployeeOrAdmin = (req, res, next) => {
  if (!res.locals.loggedin || !res.locals.accountData) {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }

  const accountType = res.locals.accountData.account_type

  if (accountType === "Employee" || accountType === "Admin") {
    return next()
  }

  req.flash("notice", "You do not have permission to access inventory management.")
  return res.redirect("/account/")
}

module.exports = Util