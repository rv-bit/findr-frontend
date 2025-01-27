import type { Route } from "../+types/_layout";

import React from "react";
import { useNavigate } from "react-router";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useToast } from "~/hooks/use-toast";

import { authClient } from "~/lib/auth";
import type { ModalProps } from "~/lib/types/modal";

import { AlertDialogFooter } from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";

import WarningComponent from "~/components/warning";

import { ChevronRight, ExternalLink, TriangleAlert, type LucideIcon } from "lucide-react";

import EmailModal from "./email-change";
import TwoFactorEnable from "./two-factor-enable";

interface Actions {
	title: string;
	defaultValue?: string | number | boolean | undefined;
	route?: string; // meaning like the url route
	icon?: LucideIcon;

	componentLoad?: React.FC<ModalProps>;

	onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
	modalShouldContinueRender?: () => boolean;
	modalActionOnClickCheck?: () => { success: boolean; error: string | null };

	items?: Actions[];
}

const emailVerifySchema = z.object({
	email: z.string().email().nonempty("Email is required"),
});

export default function Index({ matches }: Route.ComponentProps) {
	const loader = matches[1];
	const loaderData = loader.data;

	const navigate = useNavigate();
	const toast = useToast();

	const { data: session, isPending, error } = authClient.useSession();

	const actions: Actions[] = React.useMemo(
		() => [
			{
				title: "General",
				items: [
					{
						title: "Email Address",
						defaultValue: loaderData.user.email,
						icon: ChevronRight,
						modalActionOnClickCheck: () => {
							const isValid = loaderData.hasEmailVerified && loaderData.hasPassword;
							if (!isValid) {
								return { success: false, error: "Please verify your email and create a password" };
							}

							return { success: true, error: null };
						},
						componentLoad: EmailModal,
					},
					{
						title: "Password",
						defaultValue: loaderData.hasPassword ? "Set" : "Not Set",
						icon: ChevronRight,
						modalActionOnClickCheck: () => {
							const isValid = loaderData.hasEmailVerified && loaderData.hasPassword;
							if (!isValid) {
								return { success: false, error: "Please verify your email and create a password" };
							}

							return { success: true, error: null };
						},
					},
				],
			},
			{
				title: "Account authorization",
				items: [
					{
						title: "Google",
						defaultValue: loaderData.accountLists?.some((account) => account.provider === "google") ? "Connected" : "Not Connected",
						icon: ChevronRight,
						onClick: async () => {
							const hasLinked = loaderData.accountLists?.some((account) => account.provider === "google");

							if (!hasLinked) {
								await authClient.linkSocial({
									provider: "google",
									callbackURL: "/settings/account",
								});
								return;
							}

							await authClient.unlinkAccount({
								providerId: "google",
							});
						},
					},
					{
						title: "Github",
						defaultValue: loaderData.accountLists?.some((account) => account.provider === "github") ? "Connected" : "Not Connected",
						icon: ChevronRight,
						onClick: async () => {
							const hasLinked = loaderData.accountLists?.some((account) => account.provider === "github");

							if (!hasLinked) {
								await authClient.linkSocial({
									provider: "github",
									callbackURL: "/settings/account",
								});
								return;
							}

							await authClient.unlinkAccount({
								providerId: "github",
							});
						},
					},

					{
						title: "Two-Factor Authentication",
						defaultValue: loaderData.hasTwoFactor ? "Enabled" : "Disabled",
						icon: ExternalLink,
						modalActionOnClickCheck: () => {
							const isValid = loaderData.hasEmailVerified && loaderData.hasPassword;
							if (!isValid) {
								return { success: false, error: "Please verify your email and create a password" };
							}

							return { success: true, error: null };
						},
						modalShouldContinueRender: () => {
							return !loaderData.hasTwoFactor;
						},
						componentLoad: TwoFactorEnable,
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
							const isValid = loaderData.hasEmailVerified && loaderData.hasPassword;
							if (!isValid) {
								return { success: false, error: "Please verify your email and create a password" };
							}

							return { success: true, error: null };
						},
					},
				],
			},
		],
		[loaderData],
	);

	const [loading, setLoading] = React.useState(false);
	const [showWarningModal, setShowWarningModal] = React.useState(false);
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
		if (session?.user?.email !== values.email) {
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

		toast.toast({
			title: "Info",
			description: "If the email exists in our system, you will receive an email with instructions to verify your email",
		});

		setShowWarningModal(false);
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

				{loaderData.hasPassword && !loaderData.hasEmailVerified && (
					<WarningComponent
						open={showWarningModal}
						onChangeState={() => setShowWarningModal(!showWarningModal)}
						icon={TriangleAlert}
						message="Email is not verified"
						title="Verify Email"
						description="Please verify your email to continue."
						buttonType="submit"
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
											className="mt-2 bg-[#2B3236] sm:mt-0 dark:bg-[#2B3236] dark:text-white hover:dark:bg-[#2B3236]/40 rounded-3xl p-5 py-6"
											onClick={() => setShowWarningModal(false)}
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
							<h1 key={action.title} className="text-2xl font-semibold capitalize text-black dark:text-white">
								{action.title}
							</h1>

							{action.items &&
								action.items.map((item) => {
									return (
										<React.Fragment key={item.title}>
											{showModal[item.title] && item.componentLoad && (
												<item.componentLoad open={showModal[item.title]} onOpenChange={() => setShowModal((prev) => ({ ...prev, [item.title]: false }))} />
											)}

											<Button
												key={item.title}
												variant={"link"}
												className="group flex w-full items-center justify-between gap-4 bg-none p-0 hover:no-underline"
												onClick={(e) => {
													if (item.route) {
														navigate(item.route);
														return;
													}

													if (item.modalActionOnClickCheck) {
														const { success, error } = item.modalActionOnClickCheck();

														if (!success) {
															toast.toast({
																title: "Error",
																description: error,
															});
															return;
														}
													}

													if (item.modalShouldContinueRender && !item.modalShouldContinueRender()) {
														toast.toast({
															title: "Error",
															description: "This action is not available",
														});
														return;
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
