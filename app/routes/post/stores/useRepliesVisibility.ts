import { create } from "zustand";

type RepliesVisibilityState = {
	visibility: Record<string, boolean>;
	setVisibility: (commentId: string, value: boolean) => void;
	isVisible: (commentId: string) => boolean;
};

export const useRepliesVisibilityStore = create<RepliesVisibilityState>((set, get) => ({
	visibility: {},
	setVisibility: (commentId, value) =>
		set((state) => ({
			visibility: {
				...state.visibility,
				[commentId]: value,
			},
		})),
	isVisible: (commentId) => get().visibility[commentId] ?? true, // default to true if undefined
}));
