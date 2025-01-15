import type { Route } from "./+types/legal";

import React, { useState } from "react";
import * as constants from "~/constants/tos";

type SectionKey = keyof typeof constants.tos;

export default function Legal() {
	const [currentSection, setCurrentSection] = useState<SectionKey>("termsOfService");

	return (
		<div className="flex h-full w-full items-start justify-center px-7 pb-5 pt-32 max-xl:flex-col">
			<section className="top-5 flex max-w-4xl flex-col items-start justify-start max-xl:mb-10 xl:sticky xl:mr-16">
				<h1 className="mb-2 text-left text-xl font-semibold text-black dark:text-white">Legal</h1>
				<button
					data-active={currentSection === "termsOfService"}
					onClick={() => setCurrentSection("termsOfService")}
					className="text-left text-lg text-black/60 data-[active=true]:underline dark:text-white"
				>
					Terms of Service
				</button>
				<button
					data-active={currentSection === "privacyPolicy"}
					onClick={() => setCurrentSection("privacyPolicy")}
					className="text-left text-lg text-black/60 data-[active=true]:underline dark:text-white"
				>
					Privacy Policy
				</button>
			</section>

			<section className="flex max-w-4xl flex-col gap-6">
				<h1 className="font-medium tracking-tighter text-black max-xl:text-3xl xl:text-5xl dark:text-white">{constants.tos[currentSection].title}</h1>
				{constants.tos[currentSection].sections.map((section) => (
					<section key={section.title} className="flex flex-col gap-2">
						<h2 className="font-medium tracking-tight text-black max-xl:text-xl xl:text-2xl dark:text-white">{section.title}</h2>
						<p className="text-sm text-black dark:text-white">{section.content}</p>
					</section>
				))}
			</section>
		</div>
	);
}
