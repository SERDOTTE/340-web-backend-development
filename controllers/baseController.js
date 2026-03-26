const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  req.flash("notice", "This is a flash message.")
  res.render("index", {title: "Home", nav})
}

/* ***************************
 *  Trigger intentional 500 error for testing
 * ************************** */
baseController.triggerIntentionalError = async function (req, res) {
  const err = new Error("Intentional server error triggered for testing.")
  err.status = 500
  throw err
}

module.exports = baseController