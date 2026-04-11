const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const favoriteController = require("../controllers/favoriteController")
const favoriteValidate = require("../utilities/favorite-validation")

router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(favoriteController.buildFavoritesView)
)

router.post(
  "/add",
  utilities.checkLogin,
  favoriteValidate.favoriteRules(),
  favoriteValidate.checkFavoriteData,
  utilities.handleErrors(favoriteController.addFavorite)
)

router.post(
  "/remove",
  utilities.checkLogin,
  favoriteValidate.favoriteRules(),
  favoriteValidate.checkFavoriteData,
  utilities.handleErrors(favoriteController.removeFavorite)
)

module.exports = router
