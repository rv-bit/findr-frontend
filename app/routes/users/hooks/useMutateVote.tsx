import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "~/lib/axios-instance";

type VoteVariables = {
	postId: string;
	userId: string;
	type: "upvote" | "downvote";
};

export const useMutateVote = () => {
	const queryClient = useQueryClient();

	return useMutation<any, unknown, VoteVariables, { previousData: any }>({
		mutationFn: async ({ postId, type }) => {
			const { data } = await axiosInstance.post(`/api/v0/post/${type}/${postId}`);
			return data;
		},

		onMutate: async (variables) => {
			const { postId, type } = variables;

			await queryClient.cancelQueries({ queryKey: ["userData"] });

			const previousData = queryClient.getQueryData(["userData"]);

			queryClient.setQueryData(["userData"], (oldData: any) => {
				if (!oldData) return oldData;

				return {
					...oldData,
					pages: oldData.pages.map((page: any) => {
						return {
							...page,
							data: {
								...page.data,
								posts: page.data.posts.map((post: any) => {
									if (post.id !== postId) return post;

									// toggle logic
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
								}),
							},
						};
					}),
				};
			});

			return { previousData };
		},

		onError: (err, variables, context) => {
			if (context?.previousData) {
				queryClient.setQueryData(["userData"], context.previousData);
			}
		},

		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["userData"] });
		},
	});
};
