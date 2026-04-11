const { body, validationResult } = require("express-validator")
const invModel = require("../models/inventory-model")

const validate = {}

validate.favoriteRules = () => {
  return [
    body("inv_id")
      .trim()
      .notEmpty()
      .withMessage("A vehicle id is required.")
      .bail()
      .isInt({ min: 1 })
      .withMessage("A valid vehicle id is required.")
      .bail()
      .custom(async (inv_id) => {
        const vehicle = await invModel.getInventoryById(parseInt(inv_id, 10))
        if (!vehicle) {
          throw new Error("The requested vehicle could not be found.")
        }
        return true
      }),

    body("returnTo")
      .optional({ checkFalsy: true })
      .trim()
      .matches(/^\/(?!\/)[A-Za-z0-9/_-]*$/)
      .withMessage("Invalid return path."),
  ]
}

validate.checkFavoriteData = async (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const inv_id = parseInt(req.body.inv_id, 10)
    const fallbackPath = Number.isInteger(inv_id) && inv_id > 0 ? `/inv/detail/${inv_id}` : "/"
    const returnTo = typeof req.body.returnTo === "string" && req.body.returnTo.startsWith("/")
      ? req.body.returnTo
      : fallbackPath

    req.flash("notice", errors.array().map((error) => error.msg).join(" "))
    return res.redirect(returnTo)
  }

  next()
}

module.exports = validate
