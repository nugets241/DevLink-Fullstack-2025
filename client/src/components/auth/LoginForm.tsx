import React from 'react';
import { Link } from 'react-router-dom';
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

				<Link className="button button-secondary login-signup" to="/register">
					Create new account
				</Link>
			</form>
		</Card>
	);
}

export default LoginForm;
