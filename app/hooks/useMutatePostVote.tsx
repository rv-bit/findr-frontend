import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "~/lib/axios.instance";

type VoteVariables = {
	postId: string;
	type: "upvote" | "downvote";
};

const mutatePost = (post: any, type: "upvote" | "downvote") => {
	let newLikesCount = post.likesCount;
	let hasUpvoted = post.hasUpvoted || false;
	let hasDownvoted = post.hasDownvoted || false;

	if (type === "upvote") {
		if (hasUpvoted) {
			newLikesCount -= 1;
			hasUpvoted = false;
		} else {
			newLikesCount += hasDownvoted ? 2 : 1;
			hasUpvoted = true;
			hasDownvoted = false;
		}
	}

	if (type === "downvote") {
		if (hasDownvoted) {
			newLikesCount += 1;
			hasDownvoted = false;
		} else {
			newLikesCount -= hasUpvoted ? 2 : 1;
			hasDownvoted = true;
			hasUpvoted = false;
		}
	}

	return {
		...post,
		likesCount: newLikesCount,
		hasUpvoted,
		hasDownvoted,
	};
};

export const useMutatePostVote = ({ queryKey }: { queryKey: (string | undefined)[] }) => {
	const queryClient = useQueryClient();

	return useMutation<any, unknown, VoteVariables, { previousData: any }>({
		mutationFn: async ({ postId, type }) => {
			const { data } = await axiosInstance.post(`/api/v0/post/${type}/${postId}`);
			return data;
		},

		onMutate: async (variables) => {
			const { postId, type } = variables;

			await queryClient.cancelQueries({ queryKey: queryKey });

			const previousData = queryClient.getQueryData(queryKey);

			queryClient.setQueryData(queryKey, (oldData: any) => {
				if (!oldData) return oldData;

				if (oldData.pages) {
					return {
						...oldData,
						pages: oldData.pages.map((page: any) => {
							// Case 1: page.data.posts exists
							if (page.data?.posts) {
								return {
									...page,
									data: {
										...page.data,
										posts: page.data.posts.map((post: any) => (post.id === postId ? mutatePost(post, type) : post)),
									},
								};
							}

							// Case 2: page.data itself is the post
							if (page.data?.id === postId) {
								return {
									...page,
									data: mutatePost(page.data, type),
								};
							}

							// Default: no change
							return page;
						}),
					};
				}

				// Single post logic
				if (oldData.id === postId) {
					return mutatePost(oldData, type);
				}

				return oldData;
			});

			return { previousData };
		},

		onError: (err, variables, context) => {
			if (context?.previousData) {
				queryClient.setQueryData(queryKey, context.previousData);
			}
		},

		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKey });
		},
	});
};
