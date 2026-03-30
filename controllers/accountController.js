const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")



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
*  Process Login
* *************************************** */
async function accountLogin(req, res, next) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const sanitizedEmail = account_email.trim().toLowerCase()

  const accountResult = await accountModel.getAccountByEmail(sanitizedEmail)
  
  if (accountResult.rowCount === 0) {
    req.flash("notice", "Sorry, the login failed.")
    res.status(401).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
    return
  }

  const account = accountResult.rows[0]

  const isHashedPassword = account.account_password.startsWith("$2")
  let passwordMatch = false

  if (isHashedPassword) {
    passwordMatch = bcrypt.compareSync(account_password, account.account_password)
  } else {
    passwordMatch = account_password === account.account_password

    if (passwordMatch) {
      const migratedPassword = bcrypt.hashSync(account_password, 10)
      await accountModel.updateAccountPassword(account.account_id, migratedPassword)
    }
  }

  if (!passwordMatch) {
    req.flash("notice", "Sorry, the login failed.")
    res.status(401).render("account/login", {
      title: "Login",
      nav,
      errors: null,
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

module.exports = { buildLogin, buildRegister, accountLogin, registerAccount }
