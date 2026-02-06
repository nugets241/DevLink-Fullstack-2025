import React from 'react';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';

function Login() {
	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
	}

	return (
		<section aria-label="Login" className="form-card">
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
				</form>
			</Card>
			<p className="below">
				<strong>Create a Developer Profile</strong> to showcase your projects
				and skills.
			</p>
		</section>
	);
}

export default Login;
