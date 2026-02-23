export default {
	async btn_signInonClick () {
		try {
			// 1. Ejecutamos el login
			const response = await authLogin.run();

			// 2. Si el login fue exitoso (trae token)
			if (response && response.access_token) {
				await storeValue("access_token", response.access_token);
				await storeValue("user_id", response.user.id);
				
				// RECIÉN AQUÍ ordenamos ir al Dashboard
				showAlert("Bienvenido", "success");
				navigateTo("Dashboard"); 
			} 
		} catch (e) {
			// 3. Si hay error (Email/Pass incorrectos), solo avisamos
			showAlert("Credenciales incorrectas o error de conexión", "error");
			// Al no haber un navigateTo aquí, el usuario NO se mueve de página
		}
	}
}