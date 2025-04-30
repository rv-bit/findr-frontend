import type { Route } from "../profile/+types/index"; // Import the Route type from the _layout file just cause its basically the index of the routes folder

import React from "react";
import { useNavigate } from "react-router";
import { UAParser } from "ua-parser-js";

import { toast } from "sonner";

import type { ModalProps } from "~/lib/types/ui/modal";

import { EllipsisVertical, ExternalLink, Laptop, type LucideIcon } from "lucide-react";
import { type IconType } from "react-icons";
import { CiMobile3 } from "react-icons/ci";

import { Button } from "~/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";

import { authClient, type Sessions } from "~/lib/auth";
import queryClient from "~/lib/query/query-client";

import TwoFactorDisableModal from "./modals/two-factor-disable";
import TwoFactorEnableModal from "./modals/two-factor-enable";

const formatTime = (time: number | string | Date): string => {
	switch (typeof time) {
		case "number":
			break;
		case "string":
			time = +new Date(time);
			break;
		case "object":
			if (time.constructor === Date) time = time.getTime();
			break;
		default:
			time = +new Date();
	}

	var time_formats = [
		[60, "seconds", 1], // 60
		[120, "1 minute ago", "1 minute from now"], // 60*2
		[3600, "minutes", 60], // 60*60, 60
		[7200, "1 hour ago", "1 hour from now"], // 60*60*2
		[86400, "hours", 3600], // 60*60*24, 60*60
		[172800, "Yesterday", "Tomorrow"], // 60*60*24*2
		[604800, "days", 86400], // 60*60*24*7, 60*60*24
		[1209600, "Last week", "Next week"], // 60*60*24*7*4*2
		[2419200, "weeks", 604800], // 60*60*24*7*4, 60*60*24*7
		[4838400, "Last month", "Next month"], // 60*60*24*7*4*2
		[29030400, "months", 2419200], // 60*60*24*7*4*12, 60*60*24*7*4
		[58060800, "Last year", "Next year"], // 60*60*24*7*4*12*2
		[2903040000, "years", 29030400], // 60*60*24*7*4*12*100, 60*60*24*7*4*12
		[5806080000, "Last century", "Next century"], // 60*60*24*7*4*12*100*2
		[58060800000, "centuries", 2903040000], // 60*60*24*7*4*12*100*20, 60*60*24*7*4*12*100
	];

	var seconds = (new Date().getTime() - +time) / 1000,
		token = "ago",
		list_choice = 1;

	if (seconds == 0) {
		return "Just now";
	}
	if (seconds < 0) {
		seconds = Math.abs(seconds);
		token = "from now";
		list_choice = 2;
	}
	var i = 0,
		format;
	while ((format = time_formats[i++]))
		if (seconds < Number(format[0])) {
			if (typeof format[2] == "string") return String(format[list_choice]);
			else return Math.floor(seconds / format[2]) + " " + format[1] + " " + token;
		}

	return String(time);
};

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

const Sessions = (props: { currentSession: string; sessions: Sessions[] }) => {
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
				{props.sessions &&
					props.sessions.map((value, index) => {
						const lastUsed = formatTime(new Date(value.updatedAt));
						const firstCreated = formatTime(new Date(value.createdAt));
						const expiresAt = formatTime(new Date(value.expiresAt));

						return (
							<TableRow key={index} className="border-sidebar-foreground dark:border-sidebar-accent">
								<TableCell className="tracking-tight text-black dark:text-white">
									<span className="flex flex-col gap-0.5">
										<span className="flex items-center justify-start gap-1">
											{new UAParser(value.userAgent || "").getDevice().type === "mobile" ? (
												<CiMobile3 size={16} />
											) : (
												<Laptop size={16} />
											)}
											{new UAParser(value.userAgent || "").getOS().name},{" "}
											{new UAParser(value.userAgent || "").getBrowser().name}
										</span>
										{value.id === props.currentSession && (
											<p className="text-xs text-neutral-500 dark:text-neutral-400">(This Device)</p>
										)}
									</span>
								</TableCell>
								<TableCell className="text-black dark:text-white">{lastUsed}</TableCell>
								<TableCell className="text-black dark:text-white">{firstCreated}</TableCell>
								<TableCell className="text-black dark:text-white">{expiresAt}</TableCell>
								<TableCell className="text-right text-black dark:text-white">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="link" className="hover:text-sidebar-foreground/50 hover:no-underline">
												<EllipsisVertical />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent
											className="mt-3.5 w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg border border-sidebar-foreground dark:border-sidebar-accent dark:bg-modal"
											side={"bottom"}
											align="end"
											sideOffset={4}
										>
											<DropdownMenuLabel className="p-1 font-normal">
												<Button
													onClick={async () => {
														await authClient.revokeSession({
															token: value.token,
														});

														queryClient.invalidateQueries({ queryKey: ["listSessions"] });

														window.location.reload();
													}}
													variant={"link"}
													className="flex h-auto w-full items-center justify-start gap-2 px-3 text-left text-sm text-red-500 transition-all duration-150 hover:bg-primary-400/10 hover:text-primary-400 hover:no-underline dark:text-red-500 dark:hover:bg-primary-400/5"
												>
													{props.currentSession === value.id ? "Logout" : "Revoke"}
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
	const shared = matches[1];
	const sharedData = shared.data;

	const navigate = useNavigate();

	const actions: Actions[] = React.useMemo(
		() => [
			{
				title: "General",
				items: [
					{
						title: "Two-Factor Authentication",
						defaultValue: sharedData.hasTwoFactor ? "Enabled" : "Disabled",
						icon: ExternalLink,
						modalActionOnClickCheck: () => {
							const isValid = sharedData.hasEmailVerified && sharedData.hasPassword;
							if (!isValid) {
								return { success: false, error: "Please verify your email and create a password" };
							}

							return { success: true, error: null };
						},
						componentLoad: !sharedData.hasTwoFactor ? TwoFactorEnableModal : TwoFactorDisableModal,
					},
				],
			},
			{
				title: "Sessions",
				description: "Manage your active sessions",
				children: Sessions,
			},
		],
		[sharedData],
	);

	const [showModal, setShowModal] = React.useState<{ [key: string]: boolean }>({});

	return (
		<React.Fragment>
			<div className="flex h-full w-full flex-col items-start justify-center gap-2">
				{actions.map((action) => {
					return (
						<React.Fragment key={action.title}>
							<span key={action.title} className="mb-2">
								<h1 className="font-bricolage text-2xl font-semibold tracking-tighter text-black capitalize dark:text-white">
									{action.title}
								</h1>
								{action.description && <p className="text-sm text-gray-500 dark:text-gray-400">{action.description}</p>}
							</span>
							{action.children && <action.children currentSession={sharedData.session.id} sessions={sharedData.listSessions} />}

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
