import type { Route } from "./+types/account";

import React from "react";
import { useNavigate } from "react-router";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";

import WarningComponent from "~/components/warning";

import { ChevronRight, TriangleAlert, type LucideIcon } from "lucide-react";

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

const newEmailSchema = z.object({
	email: z.string().email().nonempty("Email is required"),
	confirmPassword: z.string().min(8, "Password must be at least 8 characters long"),
});

export default function Account({ matches }: Route.ComponentProps) {
	const loader = matches[1];
	const loaderData = loader.data;

	const navigate = useNavigate();

	const actions: Actions[] = React.useMemo(
		() => [
			{
				title: "General",
				items: [
					{
						title: "Email Address",
						defaultValue: loaderData.user.email,
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
							defaultValue: loaderData.user.email,
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
		],
		[loaderData],
	);

	const [loading, setLoading] = React.useState(false);
	const [showModal, setShowModal] = React.useState(false);

	const newEmailForm = useForm<z.infer<typeof newEmailSchema>>({
		mode: "onChange",
		resolver: zodResolver(newEmailSchema),
		defaultValues: {
			email: "",
			confirmPassword: "",
		},
	});

	const { formState } = newEmailForm;

	const isFormIsComplete = React.useMemo(() => {
		return formState.isValid;
	}, [formState]);

	const handleNewEmailSubmit = async (values: z.infer<typeof newEmailSchema>) => {
		// check values
		console.log(values);
	};

	return (
		<React.Fragment>
			<div className="flex h-full w-full flex-col items-start justify-center gap-2">
				{!loaderData.hasPassword && (
					<WarningComponent
						open={true}
						icon={TriangleAlert}
						message="Password is necessary to secure your account"
						title="Create Password"
						description="Create a password to secure your account."
						onContinue={(e) => {
							navigate("/auth/forgot-password", { state: { from: "create-password", email: loaderData.user.email } });
						}}
					/>
				)}

				{!loaderData.hasEmailVerified && (
					<WarningComponent
						open={showModal}
						onChangeState={() => setShowModal(!showModal)}
						icon={TriangleAlert}
						message="Email is not verified"
						title="Verify Email"
						description="Please verify your email to continue."
						buttonType="submit"
					>
						<Form {...newEmailForm}>
							<form className="w-full" onSubmit={newEmailForm.handleSubmit(handleNewEmailSubmit)}>
								<div className="flex flex-col gap-4">
									<div className="flex flex-col gap-2">
										<FormField
											control={newEmailForm.control}
											name="email"
											render={({ field }) => (
												<FormItem>
													<FormControl>
														<Input type="email" placeholder="name@example.com" required {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={newEmailForm.control}
											name="confirmPassword"
											render={({ field }) => (
												<FormItem>
													<FormControl>
														<Input type="password" placeholder="current password" required {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									<AlertDialogFooter>
										<Button
											type="button"
											className="mt-2 bg-[#2B3236] sm:mt-0 dark:bg-[#2B3236] dark:text-white hover:dark:bg-[#2B3236]/40 rounded-3xl p-5 py-6"
											onClick={() => setShowModal(false)}
										>
											Cancel
										</Button>
										<Button type="submit" className="rounded-3xl p-5 py-6" disabled={!isFormIsComplete || loading}>
											{loading ? "Loading..." : "Continue"}
										</Button>
									</AlertDialogFooter>
								</div>
							</form>
						</Form>
					</WarningComponent>
				)}

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
