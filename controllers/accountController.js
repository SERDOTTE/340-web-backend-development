const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()



/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
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
    account_firstname: "",
    account_lastname: "",
    account_email: "",
  })
}

/* ****************************************
 *  Build account management view
 * *************************************** */
async function buildManagement(req, res, next) {
  const nav = await utilities.getNav()
  let accountData = res.locals.accountData || null

  if (accountData && accountData.account_id) {
    const freshAccountData = await accountModel.getAccountById(accountData.account_id)
    if (freshAccountData) {
      accountData = freshAccountData
      res.locals.accountData = freshAccountData
      res.locals.loggedin = true
    }
  }

  res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
    accountData,
  })
}

/* ****************************************
 *  Build account update view
 * *************************************** */
async function buildUpdateAccount(req, res, next) {
  const nav = await utilities.getNav()
  const sessionAccountData = res.locals.accountData || null
  const account_id = parseInt(req.params.account_id, 10)

  if (!sessionAccountData || sessionAccountData.account_id !== account_id) {
    req.flash("notice", "Please log in to access your account information.")
    return res.redirect("/account/login")
  }

  const accountData = await accountModel.getAccountById(account_id)

  if (!accountData) {
    req.flash("notice", "Sorry, that account could not be found.")
    return res.redirect("/account/")
  }

  res.render("account/update", {
    title: "Update Account Information",
    nav,
    errors: null,
    account_id: accountData.account_id,
    account_firstname: accountData.account_firstname,
    account_lastname: accountData.account_lastname,
    account_email: accountData.account_email,
    account_type: accountData.account_type,
  })
}

/* ****************************************
 *  Process account update request
 * *************************************** */
async function updateAccount(req, res) {
  const nav = await utilities.getNav()
  const { account_id, account_firstname, account_lastname, account_email } = req.body
  const parsedAccountId = parseInt(account_id, 10)

  if (!res.locals.accountData || res.locals.accountData.account_id !== parsedAccountId) {
    req.flash("notice", "Please log in to update your account.")
    return res.redirect("/account/login")
  }

  const updateResult = await accountModel.updateAccount(
    account_firstname,
    account_lastname,
    account_email,
    parsedAccountId
  )

  const freshAccountData = await accountModel.getAccountById(parsedAccountId)

  if (updateResult && freshAccountData) {
    const accessToken = jwt.sign(freshAccountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })

    if (process.env.NODE_ENV === "development") {
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
    } else {
      res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
    }

    res.locals.accountData = freshAccountData
    res.locals.loggedin = true
    req.flash("notice", "Account information updated successfully.")
  } else {
    req.flash("notice", "Sorry, the account update failed.")
  }

  return res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
    accountData: freshAccountData || res.locals.accountData,
  })
}

/* ****************************************
 *  Process password update request
 * *************************************** */
async function updatePassword(req, res) {
  const nav = await utilities.getNav()
  const { account_id, account_password } = req.body
  const parsedAccountId = parseInt(account_id, 10)

  if (!res.locals.accountData || res.locals.accountData.account_id !== parsedAccountId) {
    req.flash("notice", "Please log in to update your password.")
    return res.redirect("/account/login")
  }

  let hashedPassword
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", "Sorry, there was an error updating the password.")
    return res.status(500).render("account/update", {
      title: "Update Account Information",
      nav,
      errors: null,
      account_id: res.locals.accountData.account_id,
      account_firstname: res.locals.accountData.account_firstname,
      account_lastname: res.locals.accountData.account_lastname,
      account_email: res.locals.accountData.account_email,
      account_type: res.locals.accountData.account_type,
    })
  }

  const updateResult = await accountModel.updateAccountPassword(parsedAccountId, hashedPassword)
  const freshAccountData = await accountModel.getAccountById(parsedAccountId)

  if (updateResult) {
    res.locals.accountData = freshAccountData || res.locals.accountData
    res.locals.loggedin = true
    req.flash("notice", "Password updated successfully.")
  } else {
    req.flash("notice", "Sorry, the password update failed.")
  }

  return res.render("account/management", {
    title: "Account Management",
    nav,
    errors: null,
    accountData: freshAccountData || res.locals.accountData,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body


  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the registration.")
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
    return
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered now ${account_firstname}.<br> Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
    })
  }
}


/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })
      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    } else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error("Access Forbidden")
  }
}

async function accountLogout(req, res) {
  res.clearCookie("jwt")
  req.flash("notice", "You have been logged out.")
  return res.redirect("/")
}

module.exports = {
  buildLogin,
  buildRegister,
  buildManagement,
  buildUpdateAccount,
  updateAccount,
  updatePassword,
  accountLogin,
  accountLogout,
  registerAccount,
}
