import { z } from "zod";

export const MAX_CONTENT_LENGTH = 600;
export const newCommentSchema = z.object({
	content: z.string().nonempty("Content is required").max(MAX_CONTENT_LENGTH, `Content must be less than ${MAX_CONTENT_LENGTH} characters`),
});
