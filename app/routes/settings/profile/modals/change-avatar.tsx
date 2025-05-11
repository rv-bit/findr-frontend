import React from "react";

import ReactCrop, { centerCrop, convertToPixelCrop, makeAspectCrop, type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { authClient } from "~/lib/auth.client";

import setCanvasPreview from "~/lib/canvas";
import type { ModalProps } from "~/lib/types/ui/modal";

import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024; // 1MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ASPECT_RATIO = 1;
const MIN_DIMENSION = 150;

const newAvatarSchema = z.object({
	image: z
		.any()
		.refine((file) => file instanceof FileList && file.length === 1, "You must select exactly one file.")
		.refine(
			(file) => file instanceof FileList && ACCEPTED_IMAGE_TYPES.includes(file[0]?.type),
			"Only .jpg, .jpeg, .png and .webp formats are supported.",
		)
		.refine(
			(file) => file instanceof FileList && file[0]?.size <= MAX_FILE_SIZE_BYTES,
			`Max image size is ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`,
		),

	croppedImage: z.string(),
});

export default function Index({ open, onOpenChange }: ModalProps) {
	const [loading, setLoading] = React.useState(false);
	const [step, setStep] = React.useState(0); // 0 = select image, 1 = crop image, 2 = confirm image

	const [crop, setCrop] = React.useState<Crop>({ unit: "%", x: 0, y: 0, width: 50, height: 50 });

	const imageRef = React.useRef<HTMLImageElement>(null);
	const canvasRef = React.useRef<HTMLCanvasElement>(null);

	const [imageSource, setImageSource] = React.useState<string>("");

	const newAvatarForm = useForm<z.infer<typeof newAvatarSchema>>({
		mode: "onChange",
		resolver: zodResolver(newAvatarSchema),
		defaultValues: {
			image: undefined,
			croppedImage: "",
		},
	});
	const { formState, trigger, control } = newAvatarForm;

	const imageValue = useWatch({
		control: control,
		name: "image",
	});
	const isFormIsValid = formState.isValid;

	function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
		const { width, height } = e.currentTarget;
		const cropWidthInPercent = (MIN_DIMENSION / width) * 100;

		const crop = makeAspectCrop(
			{
				unit: "%",
				width: cropWidthInPercent,
			},
			ASPECT_RATIO,
			width,
			height,
		);

		const centeredCrop = centerCrop(crop, width, height);
		setCrop(centeredCrop);
	}

	const handleSaveCroppedImage = async () => {
		if (!imageRef.current) return;
		if (!canvasRef.current) return;

		setLoading(true);

		const imageType = newAvatarForm.watch("image")?.[0].type;
		setCanvasPreview(imageRef.current, canvasRef.current, convertToPixelCrop(crop, imageRef.current.width, imageRef.current.height));

		const croppedImage = canvasRef.current.toDataURL(imageType);
		newAvatarForm.setValue("croppedImage", croppedImage as string, { shouldValidate: true });

		setTimeout(() => {
			// Wait for the form to update
			setLoading(false);
			setStep(2);
		}, 0);
	};

	const handleSubmit = async (values: z.infer<typeof newAvatarSchema>) => {
		await authClient.updateUser(
			{
				image: values.croppedImage,
			},
			{
				onRequest: () => {
					setLoading(true);
				},
				onResponse: (context) => {
					setLoading(false);
				},
				onError: (context) => {
					toast.error("Error", {
						description: context.error.message,
					});
				},
				onSuccess: () => {
					onOpenChange(false);

					window.location.reload();
				},
			},
		);
	};

	React.useEffect(() => {
		if (!imageValue) return;
		if (imageValue.length === 0) return;

		const run = async () => {
			const isValid = await trigger("image");
			if (!isValid) return;

			const imageUrl = URL.createObjectURL(imageValue[0]);
			setImageSource(imageUrl);
			setStep(1);
		};

		run();
	}, [imageValue, trigger]);

	return (
		<AlertDialog open={open} onOpenChange={(open) => onOpenChange(open)}>
			<AlertDialogContent className="w-[calc(95vw-20px)]">
				<AlertDialogHeader>
					<AlertDialogTitle>Change Avatar</AlertDialogTitle>
					<AlertDialogDescription className="space-y-0">Upload a new avatar.</AlertDialogDescription>
				</AlertDialogHeader>
				<section className="flex flex-col gap-2">
					<Form {...newAvatarForm}>
						<form className="w-full" onSubmit={newAvatarForm.handleSubmit(handleSubmit)}>
							<div className="flex flex-col gap-4">
								<div className="flex flex-col gap-2">
									{step === 0 && (
										<FormField
											control={newAvatarForm.control}
											name="image"
											render={({ field: { onChange, ref, value, ...fieldProps }, fieldState }) => (
												<FormItem>
													<FormControl>
														<div className="flex w-full items-center justify-center">
															<Label
																htmlFor="dropzone-file"
																onDragOver={(e) => {
																	e.preventDefault();
																}}
																onDrop={(e) => {
																	e.preventDefault();
																	const files = e.dataTransfer.files;
																	if (files && files.length > 0) {
																		newAvatarForm.setValue("image", files, { shouldValidate: true });
																	}
																}}
																className="flex h-50 w-full items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-sidebar-foreground/20 bg-sidebar-foreground/10 transition-colors duration-200 ease-in-out hover:bg-sidebar-foreground/30 dark:bg-[#2B3236] dark:hover:bg-[#2B3236]/40"
															>
																<div className="flex flex-col items-center justify-center pt-5 pb-6">
																	<svg
																		className="mb-4 h-8 w-8 text-gray-500 dark:text-gray-400"
																		aria-hidden="true"
																		xmlns="http://www.w3.org/2000/svg"
																		fill="none"
																		viewBox="0 0 20 16"
																	>
																		<path
																			stroke="currentColor"
																			strokeLinecap="round"
																			strokeLinejoin="round"
																			strokeWidth="2"
																			d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
																		/>
																	</svg>
																	<p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
																		<span className="font-semibold">Click to upload</span> or drag and drop
																	</p>
																	<p className="text-xs text-gray-500 dark:text-gray-400">
																		PNG, JPG, WEBP, JPEG (1MB max)
																	</p>
																</div>
																<Input
																	id="dropzone-file"
																	ref={ref}
																	type="file"
																	accept={ACCEPTED_IMAGE_TYPES.join(",")}
																	onChange={(e) => {
																		const files = e.target.files;
																		if (files) {
																			onChange(files); // will trigger validation properly
																			newAvatarForm.trigger("image");
																		}
																	}}
																	{...fieldProps}
																	style={{ display: "none" }}
																/>
															</Label>
														</div>
													</FormControl>
													{fieldState.error && (
														<p className="text-[0.8rem] font-medium text-red-500 dark:text-red-600">
															{fieldState.error.message}
														</p>
													)}
												</FormItem>
											)}
										/>
									)}

									{step === 1 && (
										<div className="flex h-auto min-h-95 w-full items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-sidebar-foreground/20 bg-sidebar-foreground/10 dark:bg-[#2B3236]">
											<ReactCrop
												circularCrop
												keepSelection
												aspect={ASPECT_RATIO}
												minWidth={MIN_DIMENSION}
												crop={crop}
												onChange={setCrop}
											>
												<img ref={imageRef} src={imageSource} onLoad={onImageLoad} alt="Crop" />
											</ReactCrop>
											<canvas ref={canvasRef} style={{ display: "none" }} />
										</div>
									)}

									{step === 2 && (
										<React.Fragment>
											<div className="flex flex-col gap-2">
												<img src={newAvatarForm.watch("croppedImage")} alt="Cropped Image" />
											</div>
										</React.Fragment>
									)}
								</div>

								<AlertDialogFooter>
									{step === 0 && (
										<Button
											type="button"
											className="mt-2 rounded-3xl bg-[#2B3236] p-5 py-6 sm:mt-0 dark:bg-[#2B3236] dark:text-white dark:hover:bg-[#2B3236]/40"
											onClick={() => onOpenChange(false)}
										>
											Cancel
										</Button>
									)}

									{step === 1 && (
										<React.Fragment>
											<Button
												type="button"
												className="mt-2 rounded-3xl bg-[#2B3236] p-5 py-6 sm:mt-0 dark:bg-[#2B3236] dark:text-white dark:hover:bg-[#2B3236]/40"
												onClick={() => setStep(0)}
											>
												Back
											</Button>

											<Button type="button" className="rounded-3xl p-5 py-6" onClick={handleSaveCroppedImage}>
												Continue
											</Button>
										</React.Fragment>
									)}

									{step === 2 && (
										<React.Fragment>
											<Button
												type="button"
												className="mt-2 rounded-3xl bg-[#2B3236] p-5 py-6 sm:mt-0 dark:bg-[#2B3236] dark:text-white dark:hover:bg-[#2B3236]/40"
												onClick={() => onOpenChange(false)}
											>
												Cancel
											</Button>

											<Button type="submit" className="rounded-3xl p-5 py-6" disabled={!isFormIsValid || loading}>
												{loading ? "Loading..." : "Continue"}
											</Button>
										</React.Fragment>
									)}
								</AlertDialogFooter>
							</div>
						</form>
					</Form>
				</section>
			</AlertDialogContent>
		</AlertDialog>
	);
}
