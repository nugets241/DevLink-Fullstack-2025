import React from 'react';
import Card from '../common/Card';
import Input from '../common/Input';

function Login() {
	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
	}

	return (
		<section aria-label="Login">
			<Card>
				<form className="form" onSubmit={handleSubmit}>
					<Input
						id="login-identifier"
						name="identifier"
						type="email"
						autoComplete="username"
						placeholder="Email"
						required
					/>
					<Input
						id="login-password"
						name="password"
						type="password"
						autoComplete="current-password"
						placeholder="Password"
						required
					/>
				</form>
			</Card>
		</section>
	);
}

export default Login;
