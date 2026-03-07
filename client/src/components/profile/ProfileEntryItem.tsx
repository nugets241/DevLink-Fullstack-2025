import React from 'react';
import { LuPencil, LuX } from 'react-icons/lu';
import Button from '../common/Button';

type ProfileEntryItemProps = {
	variant: 'experience' | 'education';
	title: string;
	subtitle: React.ReactNode;
	dateText?: React.ReactNode;
	extraText?: React.ReactNode;
	description?: React.ReactNode;
	onDelete: () => void;
	onEdit: () => void;
	deleteAriaLabel: string;
	editAriaLabel: string;
};

function ProfileEntryItem({
	variant,
	title,
	subtitle,
	dateText,
	extraText,
	description,
	onDelete,
	onEdit,
	deleteAriaLabel,
	editAriaLabel,
}: ProfileEntryItemProps) {
	const itemClassName = `profile-${variant}-item`;
	const headerClassName = `profile-${variant}-item-header`;
	const datesClassName = `profile-${variant}-dates`;
	const descriptionClassName = `profile-${variant}-description`;

	return (
		<article className={itemClassName}>
			<div className={headerClassName}>
				<div>
					<h3>{title}</h3>
					<p>{subtitle}</p>
					{dateText && <p className={datesClassName}>{dateText}</p>}
					{extraText}
				</div>
				<div>
					<Button
						type="button"
						variant="icon"
						onClick={onDelete}
						aria-label={deleteAriaLabel}
					>
						<LuX aria-hidden="true" focusable="false" />
					</Button>
					<Button
						type="button"
						variant="icon"
						onClick={onEdit}
						aria-label={editAriaLabel}
					>
						<LuPencil aria-hidden="true" focusable="false" />
					</Button>
				</div>
			</div>
			{description && <p className={descriptionClassName}>{description}</p>}
		</article>
	);
}

export default ProfileEntryItem;
