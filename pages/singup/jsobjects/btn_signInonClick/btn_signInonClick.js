export default {
	async btn_signInonClick () {
		try {
			// Ejecuta el query de login
			await authLogin.run();
			// Guarda datos útiles en el store (persisten en toda la app)
			storeValue("access_token", authLogin.data.access_token);
			storeValue("refresh_token", authLogin.data.refresh_token);
			storeValue("user_id", authLogin.data.user.id);
		} catch(e) {


		}
		// Redirige al dashboard
		// navigateTo("Dashboard");
	}
}
