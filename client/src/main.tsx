import { Component, type ReactNode, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from './App.tsx';
import './assets/styles/main.scss';
import { store } from './store/store.ts';

type RootErrorBoundaryState = {
	hasError: boolean;
	errorMessage: string;
};

class RootErrorBoundary extends Component<
	{ children: ReactNode },
	RootErrorBoundaryState
> {
	state: RootErrorBoundaryState = {
		hasError: false,
		errorMessage: '',
	};

	static getDerivedStateFromError(error: unknown): RootErrorBoundaryState {
		return {
			hasError: true,
			errorMessage:
				error instanceof Error
					? error.message
					: 'Unexpected error while rendering the app.',
		};
	}

	render() {
		if (!this.state.hasError) {
			return this.props.children;
		}

		return (
			<div
				style={{
					minHeight: '100vh',
					display: 'grid',
					placeItems: 'center',
					padding: '24px',
					background: '#0b1220',
					color: '#f8fafc',
					fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
				}}
			>
				<div
					style={{
						maxWidth: '720px',
						width: '100%',
						border: '1px solid #273449',
						borderRadius: '10px',
						padding: '18px',
						background: '#111c2e',
					}}
				>
					<h1 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>
						Something went wrong while loading DevLink
					</h1>
					<p style={{ margin: 0, color: '#cbd5e1' }}>
						{this.state.errorMessage}
					</p>
				</div>
			</div>
		);
	}
}

const rootElement = document.getElementById('root');

if (!rootElement) {
	throw new Error('Root element not found');
}

const renderStartupFailure = (message: string) => {
	rootElement.innerHTML = `
		<div style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#0b1220;color:#f8fafc;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;">
			<div style="max-width:720px;width:100%;border:1px solid #273449;border-radius:10px;padding:18px;background:#111c2e;">
				<h1 style="margin:0 0 10px 0;font-size:1.1rem;">Unable to start DevLink</h1>
				<p style="margin:0;color:#cbd5e1;">${message}</p>
			</div>
		</div>
	`;
};

window.addEventListener('unhandledrejection', (event) => {
	console.error(event.reason);
	renderStartupFailure(
		event.reason instanceof Error
			? event.reason.message
			: 'Unhandled promise rejection during startup.',
	);
});

window.addEventListener('error', (event) => {
	console.error(event.error ?? event.message);
	renderStartupFailure(event.message || 'Unexpected startup error.');
});

try {
	createRoot(rootElement).render(
		<StrictMode>
			<RootErrorBoundary>
				<Provider store={store}>
					<BrowserRouter>
						<App />
					</BrowserRouter>
				</Provider>
			</RootErrorBoundary>
		</StrictMode>,
	);
} catch (error) {
	console.error(error);
	renderStartupFailure(
		error instanceof Error
			? error.message
			: 'Failed to initialize application.',
	);
}
