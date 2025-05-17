import "@blocknote/shadcn/style.css";

import "~/styles/editor.buttons.css"; // overwrite

import { useBlockNoteEditor, useComponentsContext, useEditorContentOrSelectionChange } from "@blocknote/react";
import { useState } from "react";

import { PiQuotesBold } from "react-icons/pi";

export function QuoteButton() {
	const editor = useBlockNoteEditor();
	const Components = useComponentsContext()!;

	const [isSelected, setIsSelected] = useState<boolean>(
		editor
			.getSelection()
			?.blocks.map((id) => editor.getBlock(id))
			.some((block) => block?.type === "quote") || false,
	);

	useEditorContentOrSelectionChange(() => {
		setIsSelected(
			editor
				.getSelection()
				?.blocks.map((id) => editor.getBlock(id))
				.some((block) => block?.type === "quote") || false,
		);

		console.log(editor.getSelection()?.blocks);
	}, editor);

	return (
		<Components.FormattingToolbar.Button
			mainTooltip={"Quote"}
			onClick={() => {
				const updateType = isSelected ? "paragraph" : "quote";
				editor.getSelection()?.blocks.forEach((id) => {
					if (!editor.getBlock(id)) return;

					switch (updateType) {
						case "paragraph":
							editor.updateBlock(id, {
								type: "paragraph",
							});
							break;
						case "quote":
							editor.updateBlock(id, {
								type: "quote",
							});
							break;
						default:
							break;
					}
				});
			}}
			isSelected={isSelected}
		>
			<PiQuotesBold size={17} />
		</Components.FormattingToolbar.Button>
	);
}
