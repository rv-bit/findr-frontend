import { authClient } from "~/lib/auth.client";

export const authErrorCodes = {
	[authClient.$ERROR_CODES.USER_ALREADY_EXISTS]: {
		en: "User already exists",
		es: "El usuario ya existe",
	},
	[authClient.$ERROR_CODES.USER_NOT_FOUND]: {
		en: "User not found",
		es: "Usuario no encontrado",
	},
	[authClient.$ERROR_CODES.FAILED_TO_CREATE_USER]: {
		en: "Failed to create user",
		es: "Error al crear el usuario",
	},
};
