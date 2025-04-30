export interface ModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;

	onClickAction?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}
