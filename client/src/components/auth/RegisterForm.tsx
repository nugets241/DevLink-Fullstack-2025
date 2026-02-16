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

	React.useEffect(() => {
		if (token) navigate('/', { replace: true });
	}, [token, navigate]);

	function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		const { name, value } = event.target;
		setFormValues((prev) => ({ ...prev, [name]: value }));
		if (name === 'confirmPassword' || name === 'password') {
			setConfirmError(undefined);
		}
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (formValues.password !== formValues.confirmPassword) {
			setConfirmError('Passwords do not match.');
			return;
		}

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
					error={fieldErrors.name}
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
					error={fieldErrors.password}
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
				{error && <p className="error">{error}</p>}
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
