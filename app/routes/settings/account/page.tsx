import type { Route } from "./+types/page";

import React from "react";
import { useNavigate } from "react-router";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { toast } from "sonner";

import { authClient } from "~/lib/auth-client";
import queryClient from "~/lib/query-client";

import type { ModalProps } from "~/lib/types/ui/modal";

import { AlertDialogFooter } from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";

import WarningComponent from "~/components/ui/warning-dialog";

import { ChevronRight, TriangleAlert, type LucideIcon } from "lucide-react";

import DeleteModal from "./components/modal.delete-account";
import EmailModal from "./components/modal.email-change";
import PasswordChangeModal from "./components/modal.password-change";

export function meta({ params }: Route.MetaArgs) {
	return [{ title: "Account Settings" }, { name: "description", content: "Account Settings" }];
}

interface Actions {
	title: string;
	defaultValue?: string | number | boolean | undefined;
	route?: string; // meaning like the url route
	icon?: LucideIcon;
	disabled?: boolean;

	componentLoad?: React.FC<ModalProps>;

	onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;

	modalActionOnClickCheck?: () => { success: boolean; error: string | null };
	modalActionOnClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;

	items?: Actions[];
}

const emailVerifySchema = z.object({
	email: z.string().email().nonempty("Email is required"),
});

export default function Index({ matches }: Route.ComponentProps) {
	const shared = matches[1];
	const sharedData = shared.data;

	const navigate = useNavigate();

	const actions: Actions[] = React.useMemo(
		() => [
			{
				title: "General",
				items: [
					{
						title: "Email Address",
						defaultValue: sharedData.user.email,
						icon: ChevronRight,
						modalActionOnClickCheck: () => {
							const isValid = sharedData.hasEmailVerified && sharedData.hasPassword;
							if (!isValid) {
								return { success: false, error: "Please verify your email and create a password" };
							}

							return { success: true, error: null };
						},
						componentLoad: EmailModal,
					},
					{
						title: "Password",
						icon: ChevronRight,
						modalActionOnClickCheck: () => {
							const isValid = sharedData.hasEmailVerified && sharedData.hasPassword;
							if (!isValid) {
								return { success: false, error: "Please verify your email and create a password" };
							}

							return { success: true, error: null };
						},

						componentLoad: PasswordChangeModal,
					},
				],
			},
			{
				title: "Account authorization",
				items: [
					{
						title: "Google",
						defaultValue: sharedData.accountLists?.some((account) => account.provider === "google") ? "Connected" : "Not Connected",
						icon: ChevronRight,
						onClick: async () => {
							const hasLinked = sharedData.accountLists?.some((account) => account.provider === "google");

							if (!hasLinked) {
								await authClient.linkSocial({
									provider: "google",
									callbackURL: window.location.origin + "/settings/account",
								});
								return;
							}

							await authClient.unlinkAccount({
								providerId: "google",
							});

							queryClient.invalidateQueries({ queryKey: ["listAccounts"] });
							window.location.reload();
						},
					},
					{
						title: "Github",
						defaultValue: sharedData.accountLists?.some((account) => account.provider === "github") ? "Connected" : "Not Connected",
						icon: ChevronRight,
						onClick: async () => {
							const hasLinked = sharedData.accountLists?.some((account) => account.provider === "github");

							if (!hasLinked) {
								await authClient.linkSocial({
									provider: "github",
									callbackURL: window.location.origin + "/settings/account",
								});
								return;
							}

							await authClient.unlinkAccount({
								providerId: "github",
							});

							queryClient.invalidateQueries({ queryKey: ["listAccounts"] });
							window.location.reload();
						},
					},
				],
			},
			{
				title: "Advanced",
				items: [
					{
						title: "Delete Account",
						icon: ChevronRight,
						modalActionOnClickCheck: () => {
							const isValid = sharedData.hasEmailVerified && sharedData.hasPassword;
							if (!isValid) {
								return { success: false, error: "Please verify your email and create a password" };
							}

							const hasLinked = sharedData.accountLists?.some((account) => account.provider !== "credential");
							if (hasLinked) {
								return { success: false, error: "You need to unlink your social account/s first" };
							}

							const hasTwoFactor = sharedData.hasTwoFactor;
							if (hasTwoFactor) {
								return { success: false, error: "You need to disable two-factor authentication first" };
							}

							return { success: true, error: null };
						},
						modalActionOnClick: async () => {
							return await authClient.deleteUser({
								callbackURL: "/auth/verify-delete",
							});
						},

						componentLoad: DeleteModal,
					},
				],
			},
		],
		[sharedData],
	);

	const [loading, setLoading] = React.useState(false);
	const [showWarningModal, setShowWarningModal] = React.useState<{ [key: string]: boolean }>({});
	const [showModal, setShowModal] = React.useState<{ [key: string]: boolean }>({});

	const emailVerifyForm = useForm<z.infer<typeof emailVerifySchema>>({
		mode: "onChange",
		resolver: zodResolver(emailVerifySchema),
		defaultValues: {
			email: "",
		},
	});

	const { formState } = emailVerifyForm;
	const isFormIsComplete = formState.isValid;

	const handleNewEmailSubmit = async (values: z.infer<typeof emailVerifySchema>) => {
		if (sharedData?.user?.email !== values.email) {
			emailVerifyForm.setError("email", {
				type: "manual",
				message: "Email does not match the email in our system",
			});
			return;
		}

		setLoading(true);

		await authClient.sendVerificationEmail({
			email: values.email,
			callbackURL: "/auth/verify-email", // The redirect URL after verification
		});

		setLoading(false);

		toast.info("Info", {
			description: "If the email exists in our system, you will receive an email with instructions to verify your email",
		});

		setShowWarningModal({ ...showWarningModal, emailVerify: false });

		emailVerifyForm.reset();
		navigate("/auth");
	};

	return (
		<React.Fragment>
			<div className="flex h-full w-full flex-col items-start justify-center gap-2">
				{!sharedData.hasPassword && (
					<WarningComponent
						open={showWarningModal.createPassword}
						onChangeState={() => setShowWarningModal({ ...showWarningModal, createPassword: !showWarningModal.createPassword })}
						icon={TriangleAlert}
						message="Password is necessary to secure your account"
						title="Create Password"
						description="Create a password to secure your account."
						onContinue={(e) => {
							navigate("/auth/forgot-password", { state: { from: "create-password", email: sharedData.user.email } });
						}}
					/>
				)}

				{sharedData.hasPassword && !sharedData.hasEmailVerified && (
					<WarningComponent
						open={showWarningModal.emailVerify}
						onChangeState={() => setShowWarningModal({ ...showWarningModal, emailVerify: !showWarningModal.emailVerify })}
						icon={TriangleAlert}
						message="Email is not verified"
						title="Verify Email"
						description="Please verify your email to continue."
					>
						<Form {...emailVerifyForm}>
							<form className="w-full" onSubmit={emailVerifyForm.handleSubmit(handleNewEmailSubmit)}>
								<div className="flex flex-col gap-4">
									<div className="flex flex-col gap-2">
										<FormField
											control={emailVerifyForm.control}
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
									</div>

									<AlertDialogFooter>
										<Button
											type="button"
											className="mt-2 rounded-3xl bg-[#2B3236] p-5 py-6 sm:mt-0 dark:bg-[#2B3236] dark:text-white dark:hover:bg-[#2B3236]/40"
											onClick={() =>
												setShowWarningModal({
													...showWarningModal,
													emailVerify: !showWarningModal.emailVerify,
												})
											}
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
							<h1
								key={action.title}
								className="mb-2 font-bricolage text-2xl font-semibold tracking-tighter text-black capitalize dark:text-white"
							>
								{action.title}
							</h1>

							{action.items &&
								action.items.map((item) => {
									return (
										<React.Fragment key={item.title}>
											{showModal[item.title] && item.componentLoad && (
												<item.componentLoad
													open={showModal[item.title]}
													onOpenChange={() => setShowModal((prev) => ({ ...prev, [item.title]: false }))}
													onClickAction={item.modalActionOnClick}
												/>
											)}

											<Button
												key={item.title}
												variant={"link"}
												disabled={item.disabled}
												className="group flex w-full items-center justify-between gap-4 bg-none p-0 hover:no-underline"
												onClick={(e) => {
													if (item.route) {
														navigate(item.route);
														return;
													}

													if (item.modalActionOnClickCheck) {
														const { success, error } = item.modalActionOnClickCheck();

														if (!success) {
															toast.error("Error", {
																description: error,
															});
															return;
														}
													}

													if (item.onClick) {
														item.onClick(e);
														return;
													}

													if (item.componentLoad) {
														setShowModal((prev) => ({ ...prev, [item.title]: true }));
													}
												}}
											>
												<span>{item.title}</span>
												<div className="flex items-center justify-center gap-2">
													<h1 className="">{item?.defaultValue}</h1>
													<div className="flex size-10 items-center justify-center rounded-full group-hover:bg-gray-600/60 dark:group-hover:bg-gray-500/40">
														{item.icon && <item.icon size={24} />}
													</div>
												</div>
											</Button>
										</React.Fragment>
									);
								})}
						</React.Fragment>
					);
				})}
			</div>
		</React.Fragment>
	);
}
