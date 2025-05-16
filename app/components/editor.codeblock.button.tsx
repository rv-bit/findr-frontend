import "@blocknote/shadcn/style.css";

import "~/styles/mdx.buttons.css"; // overwrite

import { useBlockNoteEditor, useComponentsContext, useEditorContentOrSelectionChange } from "@blocknote/react";
import { useState } from "react";

import { IoCodeSlash } from "react-icons/io5";

export function CodeBockButton() {
	const editor = useBlockNoteEditor();
	const Components = useComponentsContext()!;

	const [isSelected, setIsSelected] = useState<boolean>(
		editor
			.getSelection()
			?.blocks.map((id) => editor.getBlock(id))
			.some((block) => block?.type === "codeBlock") || false,
	);

	useEditorContentOrSelectionChange(() => {
		setIsSelected(
			editor
				.getSelection()
				?.blocks.map((id) => editor.getBlock(id))
				.some((block) => block?.type === "codeBlock") || false,
		);

		console.log(editor.getSelection()?.blocks);
	}, editor);

	return (
		<Components.FormattingToolbar.Button
			mainTooltip={"Code Block"}
			onClick={() => {
				const updateType = isSelected ? "paragraph" : "codeBlock";
				editor.getSelection()?.blocks.forEach((id) => {
					if (!editor.getBlock(id)) return;

					switch (updateType) {
						case "paragraph":
							editor.updateBlock(id, {
								type: "paragraph",
							});
							break;
						case "codeBlock":
							editor.updateBlock(id, {
								type: "codeBlock",
								props: {
									language: "typescript",
								},
							});
							break;
						default:
							break;
					}
				});
			}}
			isSelected={isSelected}
			className="rounded-full dark:bg-red-500"
		>
			<IoCodeSlash size={17} />
		</Components.FormattingToolbar.Button>
	);
}
