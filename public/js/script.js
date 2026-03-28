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
})
