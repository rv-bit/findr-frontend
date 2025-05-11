import type { Route } from "./+types/page";

import React from "react";
import { useNavigate } from "react-router";

import { toast } from "sonner";

import type { ModalProps } from "~/lib/types/ui/modal";

import { ChevronRight, type LucideIcon } from "lucide-react";
import { Button } from "~/components/ui/button";

import AvatarChangeModal from "./modals/change-avatar";
import DescriptionChangeModal from "./modals/change-description";
import UsernameChangeModal from "./modals/change-username";

export function meta({ params }: Route.MetaArgs) {
	return [{ title: "Profile Settings" }, { name: "description", content: "Profile Settings" }];
}

interface Actions {
	title: string;
	description?: string;
	defaultValue?: string | number | boolean | undefined | null;
	route?: string; // meaning like the url route
	icon?: LucideIcon;
	disabled?: boolean;

	componentLoad?: React.FC<ModalProps>;

	onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;

	modalActionOnClickCheck?: () => { success: boolean; error: string | null };
	modalActionOnClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;

	items?: Actions[];
}

export default function Index({ matches }: Route.ComponentProps) {
	const loader = matches[1];
	const loaderData = loader.data;

	const navigate = useNavigate();

	const [showModal, setShowModal] = React.useState<{ [key: string]: boolean }>({});

	const actions: Actions[] = React.useMemo(
		() => [
			{
				title: "General",
				items: [
					{
						title: "Username",
						description: "Change your username, this will also change your profile avatar, if you have one",
						defaultValue: loaderData.user.username,
						icon: ChevronRight,
						modalActionOnClickCheck: () => {
							const isValid = loaderData.hasEmailVerified && loaderData.hasPassword;
							if (!isValid) {
								return { success: false, error: "Please verify your email and create a password" };
							}

							return { success: true, error: null };
						},

						componentLoad: UsernameChangeModal,
					},
					{
						title: "About Description",
						icon: ChevronRight,
						modalActionOnClickCheck: () => {
							const isValid = loaderData.hasEmailVerified && loaderData.hasPassword;
							if (!isValid) {
								return { success: false, error: "Please verify your email and create a password" };
							}

							return { success: true, error: null };
						},

						componentLoad: DescriptionChangeModal,
					},
					{
						title: "Avatar",
						description: "Upload a new avatar",
						icon: ChevronRight,
						modalActionOnClickCheck: () => {
							const isValid = loaderData.hasEmailVerified && loaderData.hasPassword;
							if (!isValid) {
								return { success: false, error: "Please verify your email and create a password" };
							}

							return { success: true, error: null };
						},

						componentLoad: AvatarChangeModal,
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
												className="group flex h-auto w-full items-center justify-between gap-4 bg-none p-0 hover:no-underline"
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
												<div className="flex w-fit flex-col items-start justify-center gap-[0.15rem]">
													<span>{item.title}</span>
													{item.description && (
														<span className="text-left text-xs text-balance text-gray-500 dark:text-gray-400">
															{item.description}
														</span>
													)}
												</div>
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
