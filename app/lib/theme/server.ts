import { createCookie } from "react-router";
import { THEME_COOKIE_MAX_AGE, THEME_COOKIE_NAME } from "~/config/cookies";

const cookie = createCookie(THEME_COOKIE_NAME, {
	maxAge: THEME_COOKIE_MAX_AGE,
	sameSite: "lax",
});

export async function parseColorScheme(request: Request) {
	const header = request.headers.get("Cookie");
	const vals = await cookie.parse(header);
	return vals ? vals.colorScheme : null;
}
