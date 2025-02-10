import React from "react";
import { useNavigate } from "react-router";

import ReactCrop, { centerCrop, convertToPixelCrop, makeAspectCrop, type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useSession } from "~/hooks/use-auth";
import { useToast } from "~/hooks/use-toast";

import { authClient } from "~/lib/auth";
import setCanvasPreview from "~/lib/canvas";
import type { ModalProps } from "~/lib/types/modal";

import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";

const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024; // 5mb
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ASPECT_RATIO = 1;
const MIN_DIMENSION = 150;

const newAvatarSchema = z.object({
	image: z
		.any()
		.refine((file) => file?.length == 1, "File is required.")
		.refine((file) => ACCEPTED_IMAGE_TYPES.includes(file?.[0]?.type), "Only .jpg, .jpeg, .png and .webp formats are supported.")
		.refine((file) => file?.[0]?.size <= MAX_FILE_SIZE_BYTES, `Max image size is ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`),
	croppedImage: z.string(),
});

export default function Index({ open, onOpenChange }: ModalProps) {
	const toast = useToast();
	const navigate = useNavigate();
	const { refetch } = useSession();

	const [loading, setLoading] = React.useState(false);
	const [step, setStep] = React.useState(0); // 0 = select image, 1 = crop image, 2 = confirm image

	const [crop, setCrop] = React.useState<Crop>({ unit: "%", x: 0, y: 0, width: 50, height: 50 });
	const [croppedArea, setCroppedArea] = React.useState<PixelCrop>({ unit: "px", x: 0, y: 0, width: 50, height: 50 });

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

	const { formState } = newAvatarForm;

	const fileRef = newAvatarForm.register("image", { required: true });
	const isFormIsValid = formState.isValid;

	const handleOnCropComplete = (croppedAreaPixels: PixelCrop, croppedAreaPercentage: Crop) => {
		setCroppedArea(croppedAreaPixels);
	};

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

				onSuccess: async () => {
					onOpenChange(false);

					await authClient.signOut();
					await refetch();

					navigate("/auth");
				},

				onError(context) {
					toast.toast({
						title: "Error",
						description: context.error.message,
					});
				},

				onResponse(context) {
					setLoading(false);
				},
			},
		);
	};

	React.useEffect(() => {
		const { unsubscribe } = newAvatarForm.watch((value) => {
			newAvatarForm.trigger("image").then((isValid) => {
				if (!isValid) return;

				const imageUrl = URL.createObjectURL(value.image[0]);
				setImageSource(imageUrl);
				setStep(1);
			});
		});

		return () => unsubscribe();
	}, [newAvatarForm.watch, newAvatarForm.trigger]);

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
											render={({ field }) => (
												<FormItem>
													<FormControl>
														<Input type="file" accept=".jpg,.jpeg,.png,.webp" {...fileRef} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									)}

									{step === 1 && (
										<div className="flex items-center justify-center">
											<ReactCrop
												circularCrop
												keepSelection
												aspect={ASPECT_RATIO}
												minWidth={MIN_DIMENSION}
												crop={crop}
												onChange={setCrop}
												onComplete={handleOnCropComplete}
												style={{
													width: "100%",
													maxHeight: "500px",
													display: "flex",
													justifyContent: "center",
													alignItems: "center",
												}}
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

											<span className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
												By continuing with this, you are going to be logged out and you will need to login again with the new username.
											</span>
										</React.Fragment>
									)}
								</div>

								<AlertDialogFooter>
									{step === 0 && (
										<Button
											type="button"
											className="mt-2 bg-[#2B3236] sm:mt-0 dark:bg-[#2B3236] dark:text-white dark:hover:bg-[#2B3236]/40 rounded-3xl p-5 py-6"
											onClick={() => onOpenChange(false)}
										>
											Cancel
										</Button>
									)}

									{step === 1 && (
										<React.Fragment>
											<Button
												type="button"
												className="mt-2 bg-[#2B3236] sm:mt-0 dark:bg-[#2B3236] dark:text-white dark:hover:bg-[#2B3236]/40 rounded-3xl p-5 py-6"
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
												className="mt-2 bg-[#2B3236] sm:mt-0 dark:bg-[#2B3236] dark:text-white dark:hover:bg-[#2B3236]/40 rounded-3xl p-5 py-6"
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
