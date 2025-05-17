import "@blocknote/shadcn/style.css";

import "~/styles/editor.buttons.css"; // overwrite

import { useBlockNoteEditor, useComponentsContext, useEditorContentOrSelectionChange } from "@blocknote/react";
import { useState } from "react";

import { TbTextSize } from "react-icons/tb";

export function HeadingButton() {
	const editor = useBlockNoteEditor();
	const Components = useComponentsContext()!;

	const [isSelected, setIsSelected] = useState<boolean>(
		editor
			.getSelection()
			?.blocks.map((id) => editor.getBlock(id))
			.some((block) => block?.type === "heading") || false,
	);

	useEditorContentOrSelectionChange(() => {
		setIsSelected(
			editor
				.getSelection()
				?.blocks.map((id) => editor.getBlock(id))
				.some((block) => block?.type === "heading") || false,
		);
	}, editor);

	return (
		<Components.FormattingToolbar.Button
			mainTooltip={"Heading"}
			onClick={() => {
				const updateType = isSelected ? "paragraph" : "heading";
				editor.getSelection()?.blocks.forEach((id) => {
					if (!editor.getBlock(id)) return;

					switch (updateType) {
						case "paragraph":
							editor.updateBlock(id, {
								type: "paragraph",
							});
							break;
						case "heading":
							editor.updateBlock(id, {
								type: "heading",
								props: {
									level: 3,
								},
							});
							break;
						default:
							break;
					}
				});
			}}
			isSelected={isSelected}
		>
			<TbTextSize size={17} />
		</Components.FormattingToolbar.Button>
	);
}
