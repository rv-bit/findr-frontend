import "@blocknote/shadcn/style.css";
import "~/styles/editor.buttons.css"; // overwrite

import { useBlockNoteEditor, useComponentsContext, useEditorContentOrSelectionChange } from "@blocknote/react";
import { useState } from "react";

import { MdOutlineFormatBold } from "react-icons/md";

export function BoldButton() {
	const editor = useBlockNoteEditor();
	const Components = useComponentsContext()!;

	const [isSelected, setIsSelected] = useState<boolean>(editor.getActiveStyles().bold || false);

	useEditorContentOrSelectionChange(() => {
		setIsSelected(editor.getActiveStyles().bold || false);
	}, editor);

	return (
		<Components.FormattingToolbar.Button
			mainTooltip={"Bold"}
			onClick={() => {
				editor.toggleStyles({
					bold: !editor.getActiveStyles().bold,
				});
			}}
			isSelected={isSelected}
		>
			<MdOutlineFormatBold size={17} />
		</Components.FormattingToolbar.Button>
	);
}
