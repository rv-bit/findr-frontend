import type { Route } from "./+types/login";
import { Link } from "react-router";

import { authClient } from "~/lib/auth";

import * as constants from "~/constants/default";

import { FaGithub, FaGoogle } from "react-icons/fa";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export default function Login() {
	return (
		<div className="flex h-full w-full flex-col items-center justify-center gap-6 px-2">
			<div className="flex max-w-lg flex-col gap-6">
				<div className="flex flex-col gap-6">
					<form>
						<div className="flex flex-col items-center gap-1">
							<h1 className="text-center text-xl font-semibold text-neutral-500 dark:text-neutral-400">Welcome to {constants.APP_NAME}</h1>
							<p className="text-md text-center font-medium text-neutral-500 dark:text-neutral-400">{constants.APP_DESCRIPTION}</p>
							<div className="text-balance text-center text-sm text-neutral-500 dark:text-neutral-400">
								Don&apos;t have an account?
								<Link
									to={{
										pathname: "/onboard",
									}}
									className="ml-1 underline underline-offset-4"
								>
									Sign up
								</Link>
							</div>
						</div>
						<div className="flex flex-col gap-6">
							<div className="grid gap-2">
								<Label htmlFor="email">Email</Label>
								<Input id="email" type="email" placeholder="m@example.com" required />
							</div>
							<Button type="submit" className="w-full">
								Login
							</Button>
						</div>
					</form>

					<div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-neutral-200 dark:after:border-neutral-800">
						<span className="relative z-10 bg-white px-2 text-neutral-500 dark:bg-primary dark:text-neutral-400">Or</span>
					</div>
					<div className="grid gap-2 sm:grid-cols-2">
						<Button
							onClick={() => {
								authClient.signIn.social({
									provider: "github",
								});
							}}
							variant="outline"
							className="w-full text-neutral-500 dark:text-neutral-400"
						>
							<FaGithub />
							Continue with GitHub
						</Button>
						<Button
							onClick={() => {
								authClient.signIn.social({
									provider: "google",
								});
							}}
							variant="outline"
							className="w-full text-neutral-500 dark:text-neutral-400"
						>
							<FaGoogle />
							Continue with Google
						</Button>
					</div>
				</div>
				<div className="text-balance text-center text-xs text-neutral-500 dark:text-neutral-400 [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-neutral-900 dark:hover:[&_a]:text-neutral-50">
					By clicking continue, you agree to our <Link to={{ pathname: "/legal" }}>Terms of Service</Link> and <Link to={{ pathname: "/legal" }}>Privacy Policy</Link>.
				</div>
			</div>
		</div>
	);
}
