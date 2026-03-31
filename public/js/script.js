document.addEventListener("DOMContentLoaded", () => {
	const toggleButtons = document.querySelectorAll(".toggle-password")

	toggleButtons.forEach((button) => {
		button.addEventListener("click", () => {
			const targetId = button.dataset.target
			const passwordInput = document.getElementById(targetId)

			if (!passwordInput) return

			const showPassword = passwordInput.type === "password"
			passwordInput.type = showPassword ? "text" : "password"
			button.textContent = showPassword ? "Hide" : "Show"
			button.setAttribute("aria-label", showPassword ? "Hide password" : "Show password")
		})
	})

	const registerForm = document.querySelector(".account-register__form")

	if (registerForm) {
		const requiredFields = Array.from(registerForm.querySelectorAll("input[required]"))
		const passwordInput = document.getElementById("account_password")
		const passwordRuleItems = Array.from(document.querySelectorAll("#password-rules li[data-rule]"))

		const updatePasswordRules = () => {
			if (!passwordInput || passwordRuleItems.length === 0) return

			const value = passwordInput.value
			const checks = {
				length: value.length >= 12,
				lower: /[a-z]/.test(value),
				upper: /[A-Z]/.test(value),
				number: /\d/.test(value),
				special: /[^a-zA-Z0-9]/.test(value),
				spaces: !/\s/.test(value),
			}

			passwordRuleItems.forEach((item) => {
				const rule = item.dataset.rule
				item.classList.toggle("rule-met", Boolean(checks[rule]))
			})
		}

		const getErrorMessage = (field) => {
			const value = field.value.trim()

			if (!value) return "This field must be filled in."

			if (field.id === "account_email" && !value.includes("@")) {
				return "Enter a valid email address"
			}

			if (field.id === "account_email" && !field.checkValidity()) {
				return "Enter a valid email address"
			}

			if (field.id === "account_password" && !field.checkValidity()) {
				return "Password does not meet the required format."
			}

			return ""
		}

		const setFieldError = (field, message) => {
			const errorElement = document.getElementById(`${field.id}_error`)
			if (!errorElement) return

			errorElement.textContent = message
			errorElement.classList.toggle("is-visible", Boolean(message))
			field.classList.toggle("input-error", Boolean(message))
			field.setAttribute("aria-invalid", message ? "true" : "false")
		}

		requiredFields.forEach((field) => {
			field.addEventListener("input", () => {
				setFieldError(field, getErrorMessage(field))
				if (field.id === "account_password") updatePasswordRules()
			})
		})

		updatePasswordRules()
	}

	const classificationForm = document.querySelector('.inventory-form[action="/inv/add-classification"]')
	const classificationInput = document.getElementById("classification_name")
	const classificationError = document.getElementById("classification_name_error")

	if (classificationForm && classificationInput && classificationError) {
		const lettersOnlyPattern = /^[A-Za-z]+$/

		const validateClassification = () => {
			const value = classificationInput.value.trim()
			let message = ""

			if (!value) {
				message = "This field must be filled in."
			} else if (!lettersOnlyPattern.test(value)) {
				message = "Use letters only. No numbers, spaces, or special characters."
			}

			classificationInput.classList.toggle("input-invalid", Boolean(message))
			classificationInput.classList.toggle("input-valid", !message)
			classificationError.textContent = message
			classificationError.classList.toggle("is-visible", Boolean(message))
			classificationInput.setAttribute("aria-invalid", message ? "true" : "false")

			return !message
		}

		classificationInput.addEventListener("input", validateClassification)

		classificationForm.addEventListener("submit", (event) => {
			const isValid = validateClassification()
			if (!isValid) {
				event.preventDefault()
				classificationInput.focus()
			}
		})
	}

	const addInventoryForm = document.querySelector('.inventory-form[action="/inv/add-inventory"]')

	if (addInventoryForm) {
		const inventoryFields = [
			document.getElementById("classificationList"),
			document.getElementById("inv_make"),
			document.getElementById("inv_model"),
			document.getElementById("inv_description"),
			document.getElementById("inv_image"),
			document.getElementById("inv_thumbnail"),
			document.getElementById("inv_price"),
			document.getElementById("inv_year"),
			document.getElementById("inv_miles"),
			document.getElementById("inv_color"),
		].filter(Boolean)

		const getInventoryErrorMessage = (field) => {
			const rawValue = field.value
			const value = typeof rawValue === "string" ? rawValue.trim() : rawValue

			if (!value) return "This field must be filled in."

			switch (field.id) {
				case "classificationList":
					return value ? "" : "Please choose a classification."
				case "inv_make":
				case "inv_model":
					return value.length < 3 ? "Minimum 3 characters required." : ""
				case "inv_year":
					return /^\d{4}$/.test(value) ? "" : "Use a valid 4-digit year."
				case "inv_price": {
					const usPricePattern = /^\d+(\.\d{2})$/
					return usPricePattern.test(value)
						? ""
						: "Use US format like 120.00 (dot as decimal separator)."
				}
				case "inv_miles": {
					const miles = Number(value)
					return Number.isInteger(miles) && miles >= 0 ? "" : "Enter mileage as 0 or greater."
				}
				default:
					return ""
			}
		}

		const setInventoryFieldState = (field, message) => {
			const errorElement = document.getElementById(`${field.id}_error`)

			field.classList.toggle("input-invalid", Boolean(message))
			field.classList.toggle("input-valid", !message)
			field.setAttribute("aria-invalid", message ? "true" : "false")

			if (errorElement) {
				errorElement.textContent = message
				errorElement.classList.toggle("is-visible", Boolean(message))
			}
		}

		inventoryFields.forEach((field) => {
			const eventName = field.tagName.toLowerCase() === "select" ? "change" : "input"
			field.addEventListener(eventName, () => {
				setInventoryFieldState(field, getInventoryErrorMessage(field))
			})
		})

		addInventoryForm.addEventListener("submit", (event) => {
			let hasError = false

			inventoryFields.forEach((field) => {
				const message = getInventoryErrorMessage(field)
				setInventoryFieldState(field, message)
				if (message) hasError = true
			})

			if (hasError) {
				event.preventDefault()
				const firstInvalid = inventoryFields.find((field) => field.classList.contains("input-invalid"))
				if (firstInvalid) firstInvalid.focus()
			}
		})
	}
})
