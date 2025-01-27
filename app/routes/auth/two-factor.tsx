import React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { authClient } from "~/lib/auth";

import { useNavigate } from "react-router";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "~/components/ui/input-otp";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";

interface StepProps {
	step: number;
	code?: string;
}

interface OptionsProps {
	option: string;
	title: string;
	description: string;
	disabled?: boolean;
}

const options: OptionsProps[] = [
	{
		option: "email",
		title: "Email",
		description: "Receive a code via email",
	},
	{
		option: "app",
		title: "Authenticator App",
		description: "Use an authenticator app to generate a code",
		disabled: true,
	},
];

const twoFactorEnableSchema = z.object({
	password: z.string().min(8, "Password must be at least 8 characters long"),
});

const twoFactorOptionsSchema = z.object({
	option: z.string().nonempty("Option is required"),
});

const twoFactorCodeSchema = z.object({
	code: z.string().nonempty("Code is required"),
	trustDevice: z.boolean().optional(),
});

export default function Index() {
	const navigate = useNavigate();

	const [open, onOpenChange] = React.useState(true);
	const [loading, setLoading] = React.useState(false);
	const [currentVerificationOption, setCurrentVerificationOption] = React.useState<string>("email");
	const [currentStep, setCurrentStep] = React.useState<StepProps>({
		step: 1,
		code: "",
	});

	const twoFactorForm = useForm<z.infer<typeof twoFactorEnableSchema>>({
		mode: "onChange",
		resolver: zodResolver(twoFactorEnableSchema),
		defaultValues: {
			password: "",
		},
	});

	const twoFactorOptionsForm = useForm<z.infer<typeof twoFactorOptionsSchema>>({
		mode: "onChange",
		resolver: zodResolver(twoFactorOptionsSchema),
		defaultValues: {
			option: currentVerificationOption, // Set the default value to the current verification option
		},
	});

	const twoFactorCodeForm = useForm<z.infer<typeof twoFactorCodeSchema>>({
		mode: "onChange",
		resolver: zodResolver(twoFactorCodeSchema),
		defaultValues: {
			code: "",
		},
	});

	const { formState: passwordFormState } = twoFactorForm;
	const isFormIsComplete = passwordFormState.isValid;

	const { formState: codeFormState } = twoFactorCodeForm;
	const isCodeFormIsComplete = codeFormState.isValid;

	const { formState: optionsFormState } = twoFactorOptionsForm;
	const isOptionsFormIsComplete = optionsFormState.isValid;

	const handleGetVerificationOption = async (values: z.infer<typeof twoFactorOptionsSchema>) => {
		setLoading(true);
		setCurrentVerificationOption(values.option);
		setLoading(false);

		setCurrentStep({
			step: 2,
			code: "",
		});
	};

	const handleGetCodeSubmit = React.useCallback(
		async (values: z.infer<typeof twoFactorEnableSchema>) => {
			setLoading(true);

			if (currentVerificationOption === "app") {
				const { data, error } = await authClient.twoFactor.getTotpUri({
					password: values.password,
				});

				setLoading(false);

				if (data) {
					setCurrentStep({
						step: 3,
						code: data.totpURI,
					});
				} else {
					navigate("/auth");
				}

				return;
			}

			const { data, error } = await authClient.twoFactor.sendOtp();

			setLoading(false);

			if (data) {
				setCurrentStep({
					step: 3,
				});
			} else {
				navigate("/auth");
			}
		},
		[currentVerificationOption],
	);

	const handleCodeSubmit = React.useCallback(
		async (values: z.infer<typeof twoFactorCodeSchema>) => {
			setLoading(true);

			if (currentVerificationOption === "app") {
				await authClient.twoFactor.verifyTotp(
					{
						code: values.code,
						trustDevice: values.trustDevice,
					},
					{
						onSuccess: async () => {
							setLoading(false);
							navigate("/settings");
						},
						onError: () => {
							setLoading(false);
							navigate("/");
						},
					},
				);

				return;
			}

			await authClient.twoFactor.verifyOtp(
				{
					code: values.code,
					trustDevice: values.trustDevice,
				},
				{
					onSuccess: async () => {
						setLoading(false);
						navigate("/settings");
					},
					onError: () => {
						setLoading(false);
						navigate("/");
					},
				},
			);
		},
		[currentVerificationOption],
	);

	React.useEffect(() => {
		if (!open) {
			navigate("/");
		}

		return () => {};
	}, [open]);

	return (
		<AlertDialog open={open} onOpenChange={(open) => onOpenChange(open)}>
			<AlertDialogContent className="w-[calc(95vw-20px)]">
				<AlertDialogHeader className="space-y-0">
					<AlertDialogTitle>Activate Two-Factor Authentication</AlertDialogTitle>
					<AlertDialogDescription>Idk</AlertDialogDescription>
				</AlertDialogHeader>
				<section className="flex flex-col gap-2">
					{currentStep.step === 1 && (
						<Form {...twoFactorOptionsForm}>
							<form className="w-full" onSubmit={twoFactorOptionsForm.handleSubmit(handleGetVerificationOption)}>
								<div className="flex flex-col gap-4">
									<div className="flex flex-col gap-2">
										<FormField
											control={twoFactorOptionsForm.control}
											name="option"
											render={({ field }) => (
												<FormItem>
													<FormControl>
														<RadioGroup value={field.value} onValueChange={field.onChange}>
															{options.map((option, index) => (
																<Label
																	key={index}
																	htmlFor={option.option}
																	className="flex items-center justify-start gap-4 p-5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 has-checked:border-primary-400 dark:has-checked:border-primary-400 transition-colors duration-150"
																>
																	<RadioGroupItem disabled={option.disabled} value={option.option} className="dark:border-primary-300 border-primary-300" />
																	<div className="flex flex-col justify-start items-start gap-1">
																		<h1 className="text-md font-semibold text-black dark:text-white">{option.title}</h1>
																		<p className="text-sm text-neutral-500 dark:text-neutral-400">{option.description}</p>
																	</div>
																</Label>
															))}
														</RadioGroup>
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
											onClick={() => onOpenChange(false)}
										>
											Cancel
										</Button>
										<Button type="submit" className="rounded-3xl p-5 py-6" disabled={!isOptionsFormIsComplete || loading}>
											{loading ? "Loading..." : "Continue"}
										</Button>
									</AlertDialogFooter>
								</div>
							</form>
						</Form>
					)}

					{currentStep.step === 2 && (
						<Form {...twoFactorForm}>
							<form className="w-full" onSubmit={twoFactorForm.handleSubmit(handleGetCodeSubmit)}>
								<div className="flex flex-col gap-4">
									<div className="flex flex-col gap-2">
										<FormField
											control={twoFactorForm.control}
											name="password"
											render={({ field }) => (
												<FormItem>
													<FormControl>
														<Input type="password" placeholder="password" required {...field} />
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
											onClick={() => onOpenChange(false)}
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
					)}

					{currentStep.step === 3 && (
						<Form {...twoFactorCodeForm}>
							<form className="w-full" onSubmit={twoFactorCodeForm.handleSubmit(handleCodeSubmit)}>
								<div className="flex flex-col gap-4">
									<div className="flex flex-col gap-2">
										<FormField
											control={twoFactorCodeForm.control}
											name="code"
											render={({ field }) => (
												<FormItem>
													<FormControl>
														<InputOTP maxLength={6} {...field}>
															<InputOTPGroup>
																<InputOTPSlot index={0} />
																<InputOTPSlot index={1} />
																<InputOTPSlot index={2} />
															</InputOTPGroup>
															<InputOTPSeparator />
															<InputOTPGroup>
																<InputOTPSlot index={3} />
																<InputOTPSlot index={4} />
																<InputOTPSlot index={5} />
															</InputOTPGroup>
														</InputOTP>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={twoFactorCodeForm.control}
											name="trustDevice"
											render={({ field }) => (
												<FormItem className="flex justify-start items-center gap-1 space-y-0 mt-2">
													<FormControl>
														<Checkbox checked={field.value} onCheckedChange={field.onChange}></Checkbox>
													</FormControl>
													<FormLabel>Trust this device</FormLabel>
													<FormMessage />
												</FormItem>
											)}
										/>
									</div>

									<AlertDialogFooter>
										<Button
											type="button"
											className="mt-2 bg-[#2B3236] sm:mt-0 dark:bg-[#2B3236] dark:text-white hover:dark:bg-[#2B3236]/40 rounded-3xl p-5 py-6"
											onClick={() => onOpenChange(false)}
										>
											Cancel
										</Button>
										<Button type="submit" className="rounded-3xl p-5 py-6" disabled={!isCodeFormIsComplete || loading}>
											{loading ? "Loading..." : "Continue"}
										</Button>
									</AlertDialogFooter>
								</div>
							</form>
						</Form>
					)}
				</section>
			</AlertDialogContent>
		</AlertDialog>
	);
}
