import "@blocknote/shadcn/style.css";
import "~/styles/editor.buttons.css"; // overwrite

import { useBlockNoteEditor, useComponentsContext, useEditorContentOrSelectionChange } from "@blocknote/react";
import { useState } from "react";

import { BsInfoLg } from "react-icons/bs";

export function ItalicButton() {
	const editor = useBlockNoteEditor();
	const Components = useComponentsContext()!;

	const [isSelected, setIsSelected] = useState<boolean>(editor.getActiveStyles().italic || false);

	useEditorContentOrSelectionChange(() => {
		setIsSelected(editor.getActiveStyles().italic || false);
	}, editor);

	return (
		<Components.FormattingToolbar.Button
			mainTooltip={"Italic"}
			onClick={() => {
				editor.toggleStyles({
					italic: !editor.getActiveStyles().italic,
				});
			}}
			isSelected={isSelected}
		>
			<BsInfoLg size={17} />
		</Components.FormattingToolbar.Button>
	);
}
