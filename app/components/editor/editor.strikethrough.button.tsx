import "@blocknote/shadcn/style.css";
import "~/styles/editor.buttons.css"; // overwrite

import { useBlockNoteEditor, useComponentsContext, useEditorContentOrSelectionChange } from "@blocknote/react";
import { useState } from "react";

import { BiStrikethrough } from "react-icons/bi";

export function StrikeThroughButton() {
	const editor = useBlockNoteEditor();
	const Components = useComponentsContext()!;

	const [isSelected, setIsSelected] = useState<boolean>(editor.getActiveStyles().strike || false);

	useEditorContentOrSelectionChange(() => {
		setIsSelected(editor.getActiveStyles().strike || false);
	}, editor);

	return (
		<Components.FormattingToolbar.Button
			mainTooltip={"Strikethrough"}
			onClick={() => {
				editor.toggleStyles({
					strike: !editor.getActiveStyles().strike,
				});
			}}
			isSelected={isSelected}
		>
			<BiStrikethrough size={17} />
		</Components.FormattingToolbar.Button>
	);
}
