import "@blocknote/shadcn/style.css";

import "~/styles/editor.buttons.css"; // overwrite

import { useBlockNoteEditor, useComponentsContext, useEditorContentOrSelectionChange } from "@blocknote/react";
import { useState } from "react";

import { PiListBulletsBold } from "react-icons/pi";

export function BulletListButton() {
	const editor = useBlockNoteEditor();
	const Components = useComponentsContext()!;

	const [isSelected, setIsSelected] = useState<boolean>(
		editor
			.getSelection()
			?.blocks.map((id) => editor.getBlock(id))
			.some((block) => block?.type === "bulletListItem") || false,
	);

	useEditorContentOrSelectionChange(() => {
		setIsSelected(
			editor
				.getSelection()
				?.blocks.map((id) => editor.getBlock(id))
				.some((block) => block?.type === "bulletListItem") || false,
		);

		console.log(editor.getSelection()?.blocks);
	}, editor);

	return (
		<Components.FormattingToolbar.Button
			mainTooltip={"Bullet List"}
			onClick={() => {
				const updateType = isSelected ? "paragraph" : "bulletListItem";
				editor.getSelection()?.blocks.forEach((id) => {
					if (!editor.getBlock(id)) return;

					switch (updateType) {
						case "paragraph":
							editor.updateBlock(id, {
								type: "paragraph",
							});
							break;
						case "bulletListItem":
							editor.updateBlock(id, {
								type: "bulletListItem",
							});
							break;
						default:
							break;
					}
				});
			}}
			isSelected={isSelected}
		>
			<PiListBulletsBold size={17} />
		</Components.FormattingToolbar.Button>
	);
}
