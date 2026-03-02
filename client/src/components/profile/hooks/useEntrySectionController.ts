import React from 'react';

type ConfirmingItem = {
	id: string;
	label: string;
};

type UseEntrySectionControllerProps<TFormValues> = {
	initialFormValues: TFormValues;
	clearErrors: () => void;
};

function useEntrySectionController<TFormValues>({
	initialFormValues,
	clearErrors,
}: UseEntrySectionControllerProps<TFormValues>) {
	const [isModalOpen, setIsModalOpen] = React.useState(false);
	const [formValues, setFormValues] =
		React.useState<TFormValues>(initialFormValues);
	const [deletingItemId, setDeletingItemId] = React.useState<string | null>(
		null,
	);
	const [confirmingItem, setConfirmingItem] =
		React.useState<ConfirmingItem | null>(null);
	const [editingItemId, setEditingItemId] = React.useState<string | null>(null);

	const openCreateModal = React.useCallback(() => {
		clearErrors();
		setEditingItemId(null);
		setFormValues(initialFormValues);
		setIsModalOpen(true);
	}, [clearErrors, initialFormValues]);

	const openEditModal = React.useCallback(
		(itemId: string | null, values: TFormValues) => {
			if (!itemId) return;
			clearErrors();
			setEditingItemId(itemId);
			setFormValues(values);
			setIsModalOpen(true);
		},
		[clearErrors],
	);

	const closeModal = React.useCallback(() => {
		setIsModalOpen(false);
		setEditingItemId(null);
		clearErrors();
	}, [clearErrors]);

	const openDeleteConfirmation = React.useCallback(
		(itemId: string, label?: string) => {
			clearErrors();
			setConfirmingItem({
				id: itemId,
				label: label || 'this item',
			});
		},
		[clearErrors],
	);

	const closeDeleteConfirmation = React.useCallback(() => {
		if (deletingItemId) return;
		setConfirmingItem(null);
		clearErrors();
	}, [clearErrors, deletingItemId]);

	const startDeleting = React.useCallback((itemId: string) => {
		setDeletingItemId(itemId);
	}, []);

	const stopDeleting = React.useCallback(() => {
		setDeletingItemId(null);
	}, []);

	const clearConfirmedItem = React.useCallback(() => {
		setConfirmingItem(null);
	}, []);

	return {
		isModalOpen,
		setIsModalOpen,
		formValues,
		setFormValues,
		deletingItemId,
		confirmingItem,
		editingItemId,
		openCreateModal,
		openEditModal,
		closeModal,
		openDeleteConfirmation,
		closeDeleteConfirmation,
		startDeleting,
		stopDeleting,
		clearConfirmedItem,
	};
}

export default useEntrySectionController;
