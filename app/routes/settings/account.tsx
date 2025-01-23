import type { Route } from "./+types/account";
import React from "react";

import { authClient } from "~/lib/auth";

import { Button } from "~/components/ui/button";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "~/components/ui/alert-dialog";

import { ChevronRight, type LucideIcon } from "lucide-react";

interface Actions {
	title: string;
	defaultValue?: string | number | boolean | undefined;
	type?: "modal" | "route";
	route?: string; // meaning like the url route
	icon?: LucideIcon;

	// modal
	modalTitle?: string;
	modalDescription?: string;
	modalActionOnSubmit?: () => void;
	modalActionOnClickCheck?: () => void;

	// inputFields
	inputFields?: {
		type: "text" | "email" | "password";
		placeholder: string;
		defaultValue?: string;
	};

	items?: Actions[];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
	const { data: session, error } = await authClient.getSession();
	const { data: accountLists, error: errorAccountLists } = await authClient.listAccounts();

	// if (!session) {
	// 	throw new Response("", { status: 302, headers: { Location: "/auth/login" } }); // Redirect to login
	// }

	const hasPassword = accountLists?.some((account) => account.provider === "credential");
	return {
		email: session?.user.email,
		hasPassword: hasPassword,
	};
}

export function HydrateFallback() {
	return <div>Loading...</div>;
}

export default function Account({ loaderData }: Route.ComponentProps) {
	const actions: Actions[] = React.useMemo(
		() => [
			{
				title: "General",
				items: [
					{
						title: "Email Address",
						defaultValue: loaderData.email,
						type: "modal",
						icon: ChevronRight,
						modalTitle: "Change Email Address",
						modalDescription: "Update your email address.",
						modalActionOnSubmit: () => {
							console.log("Email address updated");
						},
						modalActionOnClickCheck: () => {
							console.log("Email address check, check for password or something");
						},
						inputFields: {
							type: "email",
							placeholder: "Email Address",
							defaultValue: loaderData.email,
						},
					},
					{
						title: "Delete Account",
						type: "modal",
						icon: ChevronRight,
						modalTitle: "Are you absolutely sure?",
						modalDescription: "This action cannot be undone. This will permanently delete your account and remove your data from our servers.",
						modalActionOnSubmit: () => {
							console.log("Account deleted");
						},
						modalActionOnClickCheck: () => {
							console.log("Account delete check, check for password or something");
						},
					},
				],
			},
			{
				title: "Accounts",
				items: [
					{
						title: "Password",
						defaultValue: loaderData.hasPassword ? "Set" : "Not Set",
						type: "modal",
						icon: ChevronRight,
						modalTitle: "Change Password",
						modalDescription: "Update your password.",
						modalActionOnSubmit: () => {
							console.log("Password updated");
						},
						modalActionOnClickCheck: () => {
							console.log("Password check, check for password or something");
						},
						inputFields: {
							type: "password",
							placeholder: "Password",
						},
					},
				],
			},
		],
		[loaderData],
	);

	return (
		<React.Fragment>
			<div className="flex h-full w-full flex-col items-start justify-center gap-2">
				{actions.map((action) => {
					return (
						<React.Fragment key={action.title}>
							{!action.type && (
								<h1 key={action.title} className="text-2xl font-semibold capitalize text-black dark:text-white">
									{action.title}
								</h1>
							)}

							{action.items &&
								action.items.map((item) =>
									item.type === "modal" ? (
										<AlertDialog key={item.title}>
											<AlertDialogTrigger
												onClick={(e) => {
													if (item.modalActionOnClickCheck) {
														item.modalActionOnClickCheck();
													}
												}}
												asChild
											>
												<Button variant={"link"} className="group flex w-full items-center justify-between gap-4 bg-none p-0 hover:no-underline">
													<span>{item.title}</span>
													<div className="flex items-center justify-center gap-2">
														<h1 className="">{item?.defaultValue}</h1>
														<div className="flex size-10 items-center justify-center rounded-full group-hover:bg-gray-600/60 dark:group-hover:bg-gray-500/40">
															{item.icon && <item.icon size={24} />}
														</div>
													</div>
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent className="w-[calc(95vw-20px)]">
												<AlertDialogHeader>
													<AlertDialogTitle>{item.modalTitle}</AlertDialogTitle>
													<AlertDialogDescription>{item.modalDescription}</AlertDialogDescription>
												</AlertDialogHeader>
												{item.inputFields && (
													<div className="my-4">
														<input
															type={item.inputFields.type || "text"}
															placeholder={item.inputFields.placeholder || ""}
															defaultValue={item.inputFields.defaultValue || ""}
															className="w-full rounded border px-3 py-2 focus:outline-none focus:ring"
														/>
													</div>
												)}
												<AlertDialogFooter>
													<AlertDialogCancel>Cancel</AlertDialogCancel>
													<AlertDialogAction
														onClick={() => {
															if (item.modalActionOnSubmit) {
																item.modalActionOnSubmit();
															}
														}}
													>
														Continue
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									) : (
										<Button key={item.title} className="flex w-full items-center justify-between py-2">
											<div className="flex w-full items-center justify-between gap-4">
												<span>{item.title}</span>

												<div className="flex items-center justify-center">{item.icon && <item.icon size={24} />}</div>
											</div>
										</Button>
									),
								)}
						</React.Fragment>
					);
				})}
			</div>
		</React.Fragment>
	);
}
