import React from 'react';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';

function RegisterForm() {
	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
	}

	return (
		<Card>
			<form className="form" onSubmit={handleSubmit}>
				<Input
					id="register-name"
					name="name"
					type="text"
					autoComplete="name"
					placeholder="Name"
					required
				/>
				<Input
					id="register-identifier"
					name="identifier"
					type="email"
					autoComplete="username"
					placeholder="Email"
					hint="Want a profile image? Use a Gravatar email."
					required
				/>
				<Input
					id="register-password"
					name="password"
					type="password"
					autoComplete="new-password"
					placeholder="Password"
					required
				/>
				<Input
					id="register-confirm-password"
					name="confirmPassword"
					type="password"
					autoComplete="new-password"
					placeholder="Confirm Password"
					required
				/>
				<Button type="submit" variant="secondary" className="register">
					Register
				</Button>

				<div className="divider" role="separator" />

				<Button variant="tertiary" className="register-login" type="button">
					Already have an account?
				</Button>
			</form>
		</Card>
	);
}

export default RegisterForm;
