import React from 'react';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';

function LoginForm() {
	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
	}

	return (
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
				<Button type="submit" variant="primary" className="login">
					Log In
				</Button>

				<div className="divider" role="separator" />

				<Button variant="secondary" className="login-signup" type="button">
					Create new account
				</Button>
			</form>
		</Card>
	);
}

export default LoginForm;
