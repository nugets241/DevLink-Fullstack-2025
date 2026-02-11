import React from 'react';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import { Link } from 'react-router-dom';

function RegisterForm() {
	const [formValues, setFormValues] = React.useState({
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
	});

	function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		const { name, value } = event.target;
		setFormValues((prev) => ({ ...prev, [name]: value }));
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (formValues.password !== formValues.confirmPassword) {
			console.log('Passwords do not match');
			return;
		}
		console.log(formValues);
	}

	return (
		<Card>
			<form className="form" onSubmit={handleSubmit}>
				<div>
					<h2 className="register-title">Create a New Account</h2>
					<p className="register-subtitle">It's quick and easy.</p>
				</div>
				<div className="divider signup-top" role="separator" />
				<Input
					id="register-name"
					name="name"
					type="text"
					autoComplete="name"
					placeholder="Name"
					value={formValues.name}
					onChange={handleChange}
					required
				/>
				<Input
					id="register-email"
					name="email"
					type="email"
					autoComplete="username"
					placeholder="Email"
					hint="Want a profile image? Use a Gravatar email."
					value={formValues.email}
					onChange={handleChange}
					required
				/>
				<Input
					id="register-password"
					name="password"
					type="password"
					autoComplete="new-password"
					placeholder="Password"
					value={formValues.password}
					onChange={handleChange}
					required
				/>
				<Input
					id="register-confirm-password"
					name="confirmPassword"
					type="password"
					autoComplete="new-password"
					placeholder="Confirm Password"
					value={formValues.confirmPassword}
					onChange={handleChange}
					required
				/>
				<Button type="submit" variant="secondary" className="register">
					Register
				</Button>

				<div className="divider" role="separator" />

				<Link to="/">Already have an account?</Link>
			</form>
		</Card>
	);
}

export default RegisterForm;
