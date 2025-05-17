import "@blocknote/shadcn/style.css";
import "~/styles/editor.buttons.css"; // overwrite

import { useBlockNoteEditor, useComponentsContext, useEditorContentOrSelectionChange } from "@blocknote/react";
import { useState } from "react";

import { MdOutlineFormatBold } from "react-icons/md";

export function CodeButton() {
	const editor = useBlockNoteEditor();
	const Components = useComponentsContext()!;

	const [isSelected, setIsSelected] = useState<boolean>(editor.getActiveStyles().code || false);

	useEditorContentOrSelectionChange(() => {
		setIsSelected(editor.getActiveStyles().code || false);
	}, editor);

	return (
		<Components.FormattingToolbar.Button
			mainTooltip={"Code Block"}
			onClick={() => {
				editor.toggleStyles({
					code: !editor.getActiveStyles().code,
				});
			}}
			isSelected={isSelected}
		>
			<MdOutlineFormatBold size={17} />
		</Components.FormattingToolbar.Button>
	);
}
