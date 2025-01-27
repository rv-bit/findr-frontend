import React from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { QRCodeCanvas } from "qrcode.react";

import { authClient } from "~/lib/auth";
import type { ModalProps } from "~/lib/types/modal";

import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "~/components/ui/input-otp";

interface StepProps {
	step: number;
	qr: {
		totpURI: string;
		backupCodes: string[];
	};
}

const twoFactorEnableSchema = z.object({
	password: z.string().min(8, "Password must be at least 8 characters long"),
});

const twoFactorCodeSchema = z.object({
	code: z.string().nonempty("Code is required"),
});

export default function Index({ open, onOpenChange }: ModalProps) {
	const [currentState, setCurrentState] = React.useState<StepProps>({
		step: 1,
		qr: {
			totpURI: "",
			backupCodes: [],
		},
	});
	const [loading, setLoading] = React.useState(false);

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

		const { data } = await authClient.twoFactor.enable({
			password: values.password,
		});

		setLoading(false);

		if (data) {
			setCurrentState({
				step: 2,
				qr: data,
			});
		}
	};

	const handleCodeSubmit = async (values: z.infer<typeof twoFactorCodeSchema>) => {
		setLoading(true);

		await authClient.twoFactor.verifyTotp(
			{
				code: values.code,
			},
			{
				onSuccess: () => {
					setLoading(false);
					setCurrentState((prevData) => ({
						...prevData,
						step: 3, // display backup codes
					}));
				},
				onError: () => {
					setLoading(false);
				},
			},
		);

		// onOpenChange(false);
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

					{currentState.step === 2 && (
						<Form {...twoFactorCodeForm}>
							<form className="w-full" onSubmit={twoFactorCodeForm.handleSubmit(handleCodeSubmit)}>
								<div className="flex flex-col gap-4">
									<QRCodeCanvas size={190} value={currentState.qr.totpURI} />

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
									className="mt-2 bg-[#2B3236] sm:mt-0 dark:bg-[#2B3236] dark:text-white hover:dark:bg-[#2B3236]/40 rounded-3xl p-5 py-6"
									onClick={() => onOpenChange(false)}
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
