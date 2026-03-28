const utilities = require("../utilities/")
const accountModel = require("../models/account-model")



/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Process Login
* *************************************** */
async function accountLogin(req, res, next) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body

  const accountResult = await accountModel.getAccountByEmail(account_email)
  
  if (accountResult.rowCount === 0) {
    req.flash("notice", "Sorry, the login failed.")
    res.status(401).render("account/login", {
      title: "Login",
      nav,
    })
    return
  }

  const account = accountResult.rows[0]
  
  if (account_password !== account.account_password) {
    req.flash("notice", "Sorry, the login failed.")
    res.status(401).render("account/login", {
      title: "Login",
      nav,
    })
    return
  }

  req.flash("notice", `Welcome back ${account.account_firstname}!`)
  res.status(200).render("index", {
    title: "Home",
    nav,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_password
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered now ${account_firstname}.<br> Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

module.exports = { buildLogin, buildRegister, accountLogin, registerAccount }
