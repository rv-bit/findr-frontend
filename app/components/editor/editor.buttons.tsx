import "@blocknote/shadcn/style.css";
import "~/styles/editor.buttons.css"; // overwrite

import { useBlockNoteEditor, useComponentsContext, useEditorContentOrSelectionChange } from "@blocknote/react";
import { useState } from "react";

import { BiStrikethrough } from "react-icons/bi";
import { BsInfoLg } from "react-icons/bs";
import { HiNumberedList } from "react-icons/hi2";
import { IoCodeSlash } from "react-icons/io5";
import { MdOutlineFormatBold } from "react-icons/md";
import { PiListBulletsBold, PiQuotesBold } from "react-icons/pi";
import { TbTextSize } from "react-icons/tb";

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
	}, editor);

	return (
		<Components.FormattingToolbar.Button
			mainTooltip={"Code"}
			onClick={() => {
				const updateType = isSelected ? "paragraph" : "codeBlock";
				editor.getSelection()?.blocks.map((id) => {
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
		>
			<IoCodeSlash size={17} />
		</Components.FormattingToolbar.Button>
	);
}

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
