import type { Route } from "../profile/+types/index"; // Import the Route type from the _layout file just cause its basically the index of the routes folder

import React from "react";
import { useNavigate } from "react-router";
import { UAParser } from "ua-parser-js";

import { useToast } from "~/hooks/use-toast";

import { authClient } from "~/lib/auth";
import type { ModalProps } from "~/lib/types/modal";
import { formatTime } from "~/lib/utils";

import { EllipsisVertical, ExternalLink, Laptop, type LucideIcon } from "lucide-react";
import { type IconType } from "react-icons";
import { CiMobile3 } from "react-icons/ci";

import { Button } from "~/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";

import TwoFactorDisableModal from "./modals/two-factor-disable";
import TwoFactorEnableModal from "./modals/two-factor-enable";

interface Actions {
	title: string;
	description?: string;
	defaultValue?: string | number | boolean | undefined | null;
	route?: string; // meaning like the url route
	icon?: LucideIcon | IconType;
	disabled?: boolean;

	children?: React.FC<any>;
	componentLoad?: React.FC<ModalProps>;

	onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;

	modalActionOnClickCheck?: () => { success: boolean; error: string | null };
	modalActionOnClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;

	items?: Actions[];
}

const Sessions = (props: {
	sessionsData: Record<
		number,
		{
			id: string;
			createdAt: Date;
			updatedAt: Date;
			userId: string;
			expiresAt: Date;
			token: string;
			ipAddress?: string | null | undefined | undefined;
			userAgent?: string | null | undefined;
		}
	>;
	currentSession: string;
}) => {
	return (
		<Table containerClass="border rounded-xl border-sidebar-foreground dark:border-sidebar-accent">
			<TableHeader className="rounded-full border-sidebar-foreground dark:border-sidebar-accent">
				<TableRow className="rounded-full border-sidebar-foreground dark:border-sidebar-accent">
					<TableHead>Name</TableHead>
					<TableHead>Last Login</TableHead>
					<TableHead>First Created</TableHead>
					<TableHead>Expires At</TableHead>
					<TableHead className="text-right"></TableHead>
				</TableRow>
			</TableHeader>
			<TableBody className="rounded-full">
				{props?.sessionsData &&
					Object.entries(props.sessionsData).map(([key, value]) => {
						const lastUsed = formatTime(new Date(value.updatedAt));
						const firstCreated = formatTime(new Date(value.createdAt));
						const expiresAt = formatTime(new Date(value.expiresAt));

						return (
							<TableRow key={key} className="border-sidebar-foreground dark:border-sidebar-accent">
								<TableCell className="text-black dark:text-white tracking-tight">
									<span className="flex flex-col gap-0.5">
										<span className="flex justify-start items-center gap-1">
											{new UAParser(value.userAgent || "").getDevice().type === "mobile" ? <CiMobile3 size={16} /> : <Laptop size={16} />}
											{new UAParser(value.userAgent || "").getOS().name}, {new UAParser(value.userAgent || "").getBrowser().name}
										</span>
										{value.id === props.currentSession && <p className="text-xs text-neutral-500 dark:text-neutral-400">(This Device)</p>}
									</span>
								</TableCell>
								<TableCell className="text-black dark:text-white">{lastUsed}</TableCell>
								<TableCell className="text-black dark:text-white">{firstCreated}</TableCell>
								<TableCell className="text-black dark:text-white">{expiresAt}</TableCell>
								<TableCell className="text-right text-black dark:text-white">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="link" className="hover:no-underline hover:text-sidebar-foreground/50">
												<EllipsisVertical />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent
											className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg dark:bg-modal border border-sidebar-foreground dark:border-sidebar-accent mt-3.5"
											side={"bottom"}
											align="end"
											sideOffset={4}
										>
											<DropdownMenuLabel className="p-1 font-normal">
												<Button
													onClick={async () => {
														if (props.currentSession === value.id) {
															return;
														}

														await authClient.revokeSession({
															token: value.token,
														});

														window.location.reload();
													}}
													variant={"link"}
													className="w-full h-auto flex items-center justify-start gap-2 px-3 text-left text-sm hover:no-underline text-red-500 dark:text-red-500 hover:text-primary-400 transition-all duration-150 dark:hover:bg-primary-400/5 hover:bg-primary-400/10"
												>
													Revoke
												</Button>
											</DropdownMenuLabel>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						);
					})}
			</TableBody>
		</Table>
	);
};

export default function Index({ matches }: Route.ComponentProps) {
	const loader = matches[1];
	const loaderData = loader.data;

	const navigate = useNavigate();
	const toast = useToast();

	const actions: Actions[] = React.useMemo(
		() => [
			{
				title: "General",
				items: [
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
						componentLoad: !loaderData.hasTwoFactor ? TwoFactorEnableModal : TwoFactorDisableModal,
					},
				],
			},
			{
				title: "Sessions",
				description: "Manage your active sessions",
				children: Sessions,
			},
		],
		[loaderData],
	);

	const [showModal, setShowModal] = React.useState<{ [key: string]: boolean }>({});

	return (
		<React.Fragment>
			<div className="flex h-full w-full flex-col items-start justify-center gap-2">
				{actions.map((action) => {
					return (
						<React.Fragment key={action.title}>
							<span key={action.title} className="mb-2">
								<h1 className="text-2xl font-bricolage-grotesque tracking-tighter font-semibold capitalize text-black dark:text-white">{action.title}</h1>
								{action.description && <p className="text-sm text-gray-500 dark:text-gray-400">{action.description}</p>}
							</span>
							{action.children && <action.children sessionsData={loaderData.sessions} currentSession={loaderData.session.id} />}

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
												className="group flex w-full items-center justify-between gap-4 bg-none p-0 h-auto hover:no-underline"
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

													if (item.onClick) {
														item.onClick(e);
														return;
													}

													if (item.componentLoad) {
														setShowModal((prev) => ({ ...prev, [item.title]: true }));
													}
												}}
											>
												<div className="flex flex-col items-start justify-center gap-[0.15rem] w-fit">
													<span>{item.title}</span>
													{item.description && <span className="text-balance text-left text-xs text-gray-500 dark:text-gray-400">{item.description}</span>}
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
