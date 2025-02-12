export const strengthVariants: {
	[key: number]: {
		styles: string;
		verdict: string;
	};
} = {
	0: { styles: "", verdict: "" },
	1: { styles: "transition-all focus-visible:ring-red-500 dark:focus-visible:ring-red-500", verdict: "Weak" },
	2: {
		styles: "transition-all focus-visible:ring-orange-500 dark:focus-visible:ring-orange-500",
		verdict: "Fair",
	},
	3: { styles: "transition-all focus-visible:ring-amber-500 dark:focus-visible:ring-amber-500", verdict: "Good" },
	4: {
		styles: "transition-all focus-visible:ring-emerald-500 dark:focus-visible:ring-emerald-500",
		verdict: "Strong",
	},
};

export function getPasswordStrength(password: string) {
	if (!password) return 0;

	const criteria = [
		/(?=.*\d)/, // Contains at least one number
		/(?=.*[a-z])/, // Contains at least one lowercase
		/(?=.*[A-Z])/, // Contains at least one uppercase
		/(?=.*[!@#$%^&*(),.?":{}|<>])/, // Contains at least one special character
	];

	return criteria.reduce((strength, regex) => strength + (regex.test(password) ? 1 : 0), 0);
}
