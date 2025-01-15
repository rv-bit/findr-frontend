import type { Route } from "./+types/login";

import * as constants from "~/constants/default";

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Link } from "react-router";

export function meta({ }: Route.MetaArgs) {
    return [{ title: "Login" }, { name: "description", content: "Login" }];
}

export default function Login() {
    return (
        <div className="w-full flex min-h-svh flex-col items-center justify-center px-2">
            <div className="flex flex-col gap-6 max-w-lg">
                <form>
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col items-center gap-1">
                            <h1 className="text-center text-xl font-semibold text-neutral-500 dark:text-neutral-400">Welcome to {constants.APP_NAME}</h1>
                            <p className="text-center text-md font-medium text-neutral-500 dark:text-neutral-400">{constants.APP_DESCRIPTION}</p>
                            <div className="text-balance text-center text-sm text-neutral-500 dark:text-neutral-400">
                                Don&apos;t have an account?
                                <Link to={{
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
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                Login
                            </Button>
                        </div>
                        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-neutral-200 dark:after:border-neutral-800">
                            <span className="relative z-10 bg-white px-2 text-neutral-500 dark:bg-primary dark:text-neutral-400">
                                Or
                            </span>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                            <Button variant="outline" className="w-full text-neutral-500 dark:text-neutral-400">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 24">
                                    <path
                                        d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                                        fill="currentColor"
                                    />
                                </svg>
                                Continue with Apple
                            </Button>
                            <Button variant="outline" className="w-full text-neutral-500 dark:text-neutral-400">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 24">
                                    <path
                                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 12.48 5.867 .307 5.387.307 12s5.56 12 12.173 12c3.573 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                        fill="currentColor"
                                    />
                                </svg>
                                Continue with Google
                            </Button>
                        </div>
                    </div>
                </form>
                <div className="text-balance text-center text-xs text-neutral-500 [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-neutral-900 dark:text-neutral-400 dark:hover:[&_a]:text-neutral-50">
                    By clicking continue, you agree to our <Link to="#">Terms of Service</Link> and <Link to="#">Privacy Policy</Link>.
                </div>
            </div>
        </div>
    );
}
