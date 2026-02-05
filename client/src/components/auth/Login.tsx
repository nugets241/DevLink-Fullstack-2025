import React from 'react';
import Card from '../common/Card';

function Login() {
	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
	}

	return (
		<section aria-label="Login">
			<Card>
				<form className="form" onSubmit={handleSubmit}>
					<label className="visually-hidden" htmlFor="login-identifier">
						Email or phone number
					</label>
					<input
						id="login-identifier"
						name="identifier"
						type="text"
						autoComplete="username"
						placeholder="Email or phone number"
						required
					/>
				</form>
			</Card>
		</section>
	);
}

export default Login;
