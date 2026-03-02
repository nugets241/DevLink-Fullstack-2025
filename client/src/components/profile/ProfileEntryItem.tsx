import React from 'react';
import { LuPencil, LuX } from 'react-icons/lu';

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
	const itemClassName = `${variant}-item`;
	const headerClassName = `${variant}-item-header`;
	const datesClassName = `${variant}-dates`;
	const descriptionClassName = `${variant}-description`;

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
					<button
						type="button"
						className="icon-button"
						onClick={onDelete}
						aria-label={deleteAriaLabel}
					>
						<LuX aria-hidden="true" focusable="false" />
					</button>
					<button
						type="button"
						className="icon-button"
						onClick={onEdit}
						aria-label={editAriaLabel}
					>
						<LuPencil aria-hidden="true" focusable="false" />
					</button>
				</div>
			</div>
			{description && <p className={descriptionClassName}>{description}</p>}
		</article>
	);
}

export default ProfileEntryItem;
