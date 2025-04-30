import React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { QRCodeCanvas } from "qrcode.react";

import { authClient } from "~/lib/auth";
import type { ModalProps } from "~/lib/types/ui/modal";

import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "~/components/ui/input-otp";

interface StepProps {
	step: number;
	qr: {
		totpURI: string;
		secret: string;
		backupCodes: string[];
	};
}

const twoFactorEnableSchema = z.object({
	password: z.string().min(8, "Password must be at least 8 characters long"),
});

const twoFactorCodeSchema = z.object({
	code: z.string().nonempty("Code is required"),
	trustDevice: z.boolean().optional(),
});

export default function Index({ open, onOpenChange }: ModalProps) {
	const [loading, setLoading] = React.useState(false);
	const [currentState, setCurrentState] = React.useState<StepProps>({
		step: 1,
		qr: {
			totpURI: "",
			backupCodes: [],
			secret: "",
		},
	});

	const twoFactorForm = useForm<z.infer<typeof twoFactorEnableSchema>>({
		mode: "onChange",
		resolver: zodResolver(twoFactorEnableSchema),
		defaultValues: {
			password: "",
		},
	});

	const twoFactorCodeForm = useForm<z.infer<typeof twoFactorCodeSchema>>({
		mode: "onChange",
		resolver: zodResolver(twoFactorCodeSchema),
		defaultValues: {
			code: "",
		},
	});

	const { formState } = twoFactorForm;
	const isFormIsComplete = formState.isValid;

	const handleEnableSubmit = async (values: z.infer<typeof twoFactorEnableSchema>) => {
		setLoading(true);

		const { data, error } = await authClient.twoFactor.enable({
			password: values.password,
		});

		setLoading(false);

		if (error) {
			twoFactorForm.setError("password", {
				type: "manual",
				message: error.message,
			});
			return;
		}

		if (data) {
			const urlObj = new URL(data.totpURI);
			const secretKey = urlObj.searchParams.get("secret") ?? "";

			setCurrentState({
				step: 2,
				qr: {
					...data,
					secret: secretKey,
				},
			});
		}
	};

	const handleCodeSubmit = async (values: z.infer<typeof twoFactorCodeSchema>) => {
		await authClient.twoFactor.verifyTotp(
			{
				code: values.code,
				trustDevice: values.trustDevice,
			},
			{
				onRequest: () => {
					setLoading(true);
				},

				onResponse: (context) => {
					setLoading(false);
				},

				onSuccess: async () => {
					setCurrentState((prevData) => ({
						...prevData,
						step: 3, // display backup codes
					}));
				},

				onError: (context) => {
					twoFactorCodeForm.setError("code", {
						type: "manual",
						message: context.error.message,
					});
				},
			},
		);
	};

	return (
		<AlertDialog open={open} onOpenChange={(open) => onOpenChange(open)}>
			<AlertDialogContent className="w-[calc(95vw-20px)]">
				<AlertDialogHeader className="space-y-0">
					<AlertDialogTitle>Activate Two-Factor Authentication</AlertDialogTitle>
					<AlertDialogDescription>
						{currentState.step === 1
							? "Please enter your password to enable two-factor authentication"
							: "Scan the QR code below with your authenticator app to enable two-factor authentication"}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<section className="flex flex-col gap-2">
					{currentState.step === 1 && (
						<Form {...twoFactorForm}>
							<form className="w-full" onSubmit={twoFactorForm.handleSubmit(handleEnableSubmit)}>
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
											className="mt-2 rounded-3xl bg-[#2B3236] p-5 py-6 sm:mt-0 dark:bg-[#2B3236] dark:text-white dark:hover:bg-[#2B3236]/40"
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

					{currentState.step === 2 && (
						<Form {...twoFactorCodeForm}>
							<form className="w-full" onSubmit={twoFactorCodeForm.handleSubmit(handleCodeSubmit)}>
								<div className="flex flex-col gap-4">
									<div className="flex flex-col items-start justify-start gap-2">
										<QRCodeCanvas size={190} value={currentState.qr.totpURI} />
										<span className="flex flex-col gap-1">
											<div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-neutral-200 dark:after:border-neutral-800">
												<span className="relative z-10 bg-modal px-2 text-neutral-500 dark:text-neutral-400">Or</span>
											</div>
											<p className="text-sm break-all text-gray-500 dark:text-gray-400">{currentState.qr.secret}</p>
										</span>
									</div>

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
												<FormItem className="mt-2 flex items-start justify-start gap-2 space-y-0">
													<FormControl>
														<Checkbox checked={field.value} onCheckedChange={field.onChange}></Checkbox>
													</FormControl>
													<div className="flex flex-col items-start justify-center gap-1">
														<FormLabel>Trust this device</FormLabel>
														<FormDescription>Don't ask for a code again on this device for (60) days</FormDescription>
													</div>
													<FormMessage />
												</FormItem>
											)}
										/>

										<span className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
											By continuing with this, you are going to be logged out and you will need to login again with the new two-factor authentication enabled.
										</span>
									</div>

									<AlertDialogFooter>
										<Button
											type="button"
											className="mt-2 rounded-3xl bg-[#2B3236] p-5 py-6 sm:mt-0 dark:bg-[#2B3236] dark:text-white dark:hover:bg-[#2B3236]/40"
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

					{currentState.step === 3 && (
						<div className="flex flex-col gap-2">
							<h1 className="text-lg font-semibold">Backup Codes</h1>
							<p className="text-sm text-gray-500 dark:text-gray-400">
								These backup codes can be used to access your account in case you lose your device or cannot receive two-factor authentication codes.
							</p>
							<ul className="flex flex-col gap-2">
								{currentState.qr.backupCodes.map((code, index) => (
									<li key={index} className="flex items-center gap-2">
										<span className="text-sm font-semibold">{code}</span>
										<span className="text-xs text-gray-500 dark:text-gray-400">Use this code only once</span>
									</li>
								))}
							</ul>

							<AlertDialogFooter>
								<Button
									type="button"
									className="mt-2 rounded-3xl bg-[#2B3236] p-5 py-6 sm:mt-0 dark:bg-[#2B3236] dark:text-white dark:hover:bg-[#2B3236]/40"
									onClick={() => {
										onOpenChange(false);
										window.location.reload();
									}}
								>
									Close
								</Button>
							</AlertDialogFooter>
						</div>
					)}
				</section>
			</AlertDialogContent>
		</AlertDialog>
	);
}
