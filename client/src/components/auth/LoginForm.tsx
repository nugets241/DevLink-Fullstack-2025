import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
	clearAuthErrors,
	clearAuthError,
	clearFieldError,
	loginUser,
} from '../../store/slices/authSlice';
import { FaRegCheckCircle } from 'react-icons/fa';

function LoginForm() {
	const dispatch = useAppDispatch();
	const { error, fieldErrors } = useAppSelector((state) => state.auth);
	const [formValues, setFormValues] = React.useState({
		email: '',
		password: '',
	});
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const [showSuccess, setShowSuccess] = React.useState(false);

	React.useEffect(() => {
		dispatch(clearAuthErrors());
	}, [dispatch]);

	React.useEffect(() => {
		if (!showSuccess) return;

		const timeoutId = window.setTimeout(() => setShowSuccess(false), 1500);

		return () => window.clearTimeout(timeoutId);
	}, [showSuccess]);

	function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
		const { name, value } = event.target;
		setFormValues((prev) => ({ ...prev, [name]: value }));

		if (error && name === 'email') {
			dispatch(clearAuthError());
		}

		if (name === 'email' || name === 'password') {
			const fieldName = name as keyof typeof fieldErrors;
			if (fieldErrors[fieldName]) {
				dispatch(clearFieldError(fieldName));
			}
		}
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (isSubmitting) return;

		setIsSubmitting(true);
		setShowSuccess(false);

		try {
			await dispatch(
				loginUser({
					email: formValues.email.trim(),
					password: formValues.password,
				}),
			).unwrap();
			setShowSuccess(true);
		} catch {
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<>
			<Modal isOpen={isSubmitting || showSuccess} preventClose={isSubmitting}>
				<div className="loading-modal">
					{isSubmitting && (
						<>
							<div className="spinner"></div>
							<p>Logging in...</p>
						</>
					)}
					{showSuccess && (
						<>
							<FaRegCheckCircle
								className="success-check"
								size={40}
								aria-hidden="true"
								focusable="false"
							/>
							<p className="loading-success" role="status" aria-live="polite">
								Login successful. Redirecting...
							</p>
						</>
					)}
				</div>
			</Modal>
			<Card>
				<form className="form" onSubmit={handleSubmit}>
					{error && <p className="error">{error}</p>}
					<Input
						id="login-email"
						name="email"
						type="email"
						autoComplete="username"
						placeholder="Email"
						value={formValues.email}
						onChange={handleChange}
						error={fieldErrors.email}
						required
					/>
					<Input
						id="login-password"
						name="password"
						type="password"
						autoComplete="current-password"
						placeholder="Password"
						value={formValues.password}
						onChange={handleChange}
						error={fieldErrors.password}
						required
					/>
					<Button
						type="submit"
						variant="primary"
						className="login"
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Logging in...' : 'Log In'}
					</Button>

					<div className="divider" role="separator" />

					<Link className="button button-secondary login-signup" to="/register">
						Create new account
					</Link>
				</form>
			</Card>
		</>
	);
}

export default LoginForm;
