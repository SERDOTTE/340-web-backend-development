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

	if (!registerForm) return

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

	registerForm.addEventListener("submit", (event) => {
		let hasError = false

		requiredFields.forEach((field) => {
			const message = getErrorMessage(field)
			setFieldError(field, message)
			if (message) hasError = true
		})

		if (hasError) {
			event.preventDefault()
			const firstInvalid = requiredFields.find((field) => field.classList.contains("input-error"))
			if (firstInvalid) firstInvalid.focus()
		}
	})
})
