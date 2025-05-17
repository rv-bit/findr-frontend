import "@blocknote/shadcn/style.css";

import "~/styles/editor.buttons.css"; // overwrite

import { useBlockNoteEditor, useComponentsContext, useEditorContentOrSelectionChange } from "@blocknote/react";
import { useState } from "react";

import { HiNumberedList } from "react-icons/hi2";

export function NumberedListButton() {
	const editor = useBlockNoteEditor();
	const Components = useComponentsContext()!;

	const [isSelected, setIsSelected] = useState<boolean>(
		editor
			.getSelection()
			?.blocks.map((id) => editor.getBlock(id))
			.some((block) => block?.type === "numberedListItem") || false,
	);

	useEditorContentOrSelectionChange(() => {
		setIsSelected(
			editor
				.getSelection()
				?.blocks.map((id) => editor.getBlock(id))
				.some((block) => block?.type === "numberedListItem") || false,
		);

		console.log(editor.getSelection()?.blocks);
	}, editor);

	return (
		<Components.FormattingToolbar.Button
			mainTooltip={"Numbered List"}
			onClick={() => {
				const updateType = isSelected ? "paragraph" : "numberedListItem";
				editor.getSelection()?.blocks.forEach((id) => {
					if (!editor.getBlock(id)) return;

					switch (updateType) {
						case "paragraph":
							editor.updateBlock(id, {
								type: "paragraph",
							});
							break;
						case "numberedListItem":
							editor.updateBlock(id, {
								type: "numberedListItem",
							});
							break;
						default:
							break;
					}
				});
			}}
			isSelected={isSelected}
		>
			<HiNumberedList size={17} />
		</Components.FormattingToolbar.Button>
	);
}
