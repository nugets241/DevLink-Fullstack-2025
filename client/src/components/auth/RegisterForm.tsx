import React from 'react';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { registerUser } from '../../store/slices/authSlice';

function RegisterForm() {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { status, error, fieldErrors, token } = useAppSelector(
		(state) => state.auth,
	);
	const [formValues, setFormValues] = React.useState({
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
	});
	const [confirmError, setConfirmError] = React.useState<string | undefined>(
		undefined,
	);
	const [nameError, setNameError] = React.useState<string | undefined>(
		undefined,
	);
	const [passwordError, setPasswordError] = React.useState<string | undefined>(
		undefined,
	);

	React.useEffect(() => {
		if (token) navigate('/', { replace: true });
	}, [token, navigate]);

	function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		const { name, value } = event.target;
		setFormValues((prev) => ({ ...prev, [name]: value }));
		if (name === 'name') {
			setNameError(undefined);
		}
		if (name === 'password') {
			setPasswordError(undefined);
		}
		if (name === 'confirmPassword' || name === 'password') {
			setConfirmError(undefined);
		}
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		let isValid = true;

		if (!formValues.name.trim()) {
			setNameError('Name required.');
			isValid = false;
		}

		if (formValues.password.length < 6) {
			setPasswordError('Password must be at least 6 characters.');
			isValid = false;
		}

		if (formValues.password !== formValues.confirmPassword) {
			setConfirmError('Passwords do not match.');
			isValid = false;
		}

		if (!isValid) return;

		dispatch(
			registerUser({
				name: formValues.name.trim(),
				email: formValues.email.trim(),
				password: formValues.password,
			}),
		);
	}

	return (
		<Card>
			<form className="form" onSubmit={handleSubmit}>
				<div>
					<h2 className="register-title">Create a New Account</h2>
					<p className="register-subtitle">It's quick and easy.</p>
					{error && <p className="error">{error}</p>}
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
					error={nameError || fieldErrors.name}
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
					error={fieldErrors.email}
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
					error={passwordError || fieldErrors.password}
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
					error={confirmError}
					required
				/>
				<Button
					type="submit"
					variant="secondary"
					className="register"
					disabled={status === 'loading'}
				>
					{status === 'loading' ? 'Registering...' : 'Register'}
				</Button>

				<div className="divider" role="separator" />

				<Link to="/">Already have an account?</Link>
			</form>
		</Card>
	);
}

export default RegisterForm;
