const utilities = require("../utilities/")
const favoriteModel = require("../models/favorite-model")
const invModel = require("../models/inventory-model")

const favoriteController = {}

function getSafeReturnTo(returnTo, fallback) {
  if (typeof returnTo === "string" && returnTo.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo
  }
  return fallback
}

/* ***************************
 *  Build favorites view
 * ************************** */
favoriteController.buildFavoritesView = async function (req, res, next) {
  const nav = await utilities.getNav()

  try {
    const accountData = res.locals.accountData

    if (!accountData || !accountData.account_id) {
      req.flash("notice", "Please log in to view your favorites.")
      return res.redirect("/account/login")
    }

    const favorites = await favoriteModel.getFavoritesByAccountId(accountData.account_id)

    return res.render("account/favorites", {
      title: "My Favorites",
      nav,
      errors: null,
      favorites,
    })
  } catch (error) {
    console.error("buildFavoritesView error:", error)
    return next({ status: 500, message: "Sorry, we could not load your favorites right now." })
  }
}

/* ***************************
 *  Add a favorite
 * ************************** */
favoriteController.addFavorite = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id, 10)
  const returnTo = getSafeReturnTo(req.body.returnTo, `/inv/detail/${inv_id}`)

  try {
    const accountData = res.locals.accountData

    if (!accountData || !accountData.account_id) {
      req.flash("notice", "Please log in to save favorites.")
      return res.redirect("/account/login")
    }

    const vehicle = await invModel.getInventoryById(inv_id)

    if (!vehicle) {
      req.flash("notice", "Sorry, that vehicle could not be found.")
      return res.redirect("/inv/")
    }

    const existingFavorite = await favoriteModel.checkFavorite(inv_id, accountData.account_id)

    if (existingFavorite) {
      req.flash("notice", "That vehicle is already in your favorites.")
      return res.redirect(returnTo)
    }

    const addResult = await favoriteModel.addFavorite(inv_id, accountData.account_id)

    if (!addResult) {
      throw new Error("Favorite insert failed.")
    }

    req.flash("notice", `${vehicle.inv_make} ${vehicle.inv_model} was added to your favorites.`)
    return res.redirect(returnTo)
  } catch (error) {
    console.error("addFavorite error:", error)
    return next({ status: 500, message: "Sorry, we could not save that favorite." })
  }
}

/* ***************************
 *  Remove a favorite
 * ************************** */
favoriteController.removeFavorite = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id, 10)
  const returnTo = getSafeReturnTo(req.body.returnTo, "/favorites/")

  try {
    const accountData = res.locals.accountData

    if (!accountData || !accountData.account_id) {
      req.flash("notice", "Please log in to manage your favorites.")
      return res.redirect("/account/login")
    }

    const vehicle = await invModel.getInventoryById(inv_id)

    if (!vehicle) {
      req.flash("notice", "Sorry, that vehicle could not be found.")
      return res.redirect("/inv/")
    }

    const existingFavorite = await favoriteModel.checkFavorite(inv_id, accountData.account_id)

    if (!existingFavorite) {
      req.flash("notice", "That vehicle is not currently in your favorites.")
      return res.redirect(returnTo)
    }

    const removeResult = await favoriteModel.removeFavorite(inv_id, accountData.account_id)

    if (!removeResult) {
      throw new Error("Favorite delete failed.")
    }

    req.flash("notice", `${vehicle.inv_make} ${vehicle.inv_model} was removed from your favorites.`)
    return res.redirect(returnTo)
  } catch (error) {
    console.error("removeFavorite error:", error)
    return next({ status: 500, message: "Sorry, we could not remove that favorite." })
  }
}

module.exports = favoriteController
