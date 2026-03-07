import React from 'react';
import Button from '../common/Button';
import Textarea from '../common/Textarea';

type PostComposerProps = {
	value: string;
	onChange: (value: string) => void;
	onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
	isSubmitting: boolean;
};

function PostComposer({
	value,
	onChange,
	onSubmit,
	isSubmitting,
}: PostComposerProps) {
	return (
		<form className="post-feed-composer" onSubmit={onSubmit}>
			<Textarea
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder="Share something with your network..."
				aria-label="Create a post"
				minRows={3}
			/>
			<div className="post-feed-composer-actions">
				<Button
					type="submit"
					variant="primary"
					disabled={!value.trim() || isSubmitting}
				>
					{isSubmitting ? 'Posting...' : 'Post'}
				</Button>
			</div>
		</form>
	);
}

export default PostComposer;
