export function normalizeDateInput(value?: string) {
	if (!value) return '';
	return value.slice(0, 10);
}

export function formatDateLabel(value?: string) {
	if (!value) return '';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleDateString(undefined, {
		year: 'numeric',
		month: 'short',
	});
}
