const pool = require("../database/")

let favoritesTableReady = false

/* ***************************
 *  Ensure favorites table exists
 * ************************** */
async function ensureFavoritesTable() {
  if (favoritesTableReady) {
    return true
  }

  const sql = `
    CREATE TABLE IF NOT EXISTS public.favorite (
      favorite_id SERIAL PRIMARY KEY,
      inv_id INT NOT NULL REFERENCES public.inventory(inv_id) ON DELETE CASCADE,
      account_id INT NOT NULL REFERENCES public.account(account_id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT favorite_inv_account_unique UNIQUE (inv_id, account_id)
    )
  `

  await pool.query(sql)
  favoritesTableReady = true
  return true
}

/* ***************************
 *  Add a vehicle to favorites
 * ************************** */
async function addFavorite(inv_id, account_id) {
  try {
    await ensureFavoritesTable()
    const sql = `
      INSERT INTO public.favorite (inv_id, account_id)
      VALUES ($1, $2)
      ON CONFLICT (inv_id, account_id) DO NOTHING
      RETURNING *
    `
    const result = await pool.query(sql, [inv_id, account_id])
    return result.rows[0] || null
  } catch (error) {
    console.error("addFavorite error:", error)
    return null
  }
}

/* ***************************
 *  Remove a vehicle from favorites
 * ************************** */
async function removeFavorite(inv_id, account_id) {
  try {
    await ensureFavoritesTable()
    const sql = "DELETE FROM public.favorite WHERE inv_id = $1 AND account_id = $2 RETURNING *"
    const result = await pool.query(sql, [inv_id, account_id])
    return result.rows[0] || null
  } catch (error) {
    console.error("removeFavorite error:", error)
    return null
  }
}

/* ***************************
 *  Get all favorites for an account
 * ************************** */
async function getFavoritesByAccountId(account_id) {
  try {
    await ensureFavoritesTable()
    const sql = `
      SELECT f.favorite_id, f.created_at, i.*, c.classification_name
      FROM public.favorite AS f
      JOIN public.inventory AS i ON f.inv_id = i.inv_id
      JOIN public.classification AS c ON i.classification_id = c.classification_id
      WHERE f.account_id = $1
      ORDER BY f.created_at DESC, i.inv_make, i.inv_model
    `
    const result = await pool.query(sql, [account_id])
    return result.rows
  } catch (error) {
    console.error("getFavoritesByAccountId error:", error)
    return []
  }
}

/* ***************************
 *  Check if a favorite already exists
 * ************************** */
async function checkFavorite(inv_id, account_id) {
  try {
    await ensureFavoritesTable()
    const sql = "SELECT favorite_id, inv_id, account_id FROM public.favorite WHERE inv_id = $1 AND account_id = $2"
    const result = await pool.query(sql, [inv_id, account_id])
    return result.rows[0] || null
  } catch (error) {
    console.error("checkFavorite error:", error)
    return null
  }
}

module.exports = {
  ensureFavoritesTable,
  addFavorite,
  removeFavorite,
  getFavoritesByAccountId,
  checkFavorite,
}
