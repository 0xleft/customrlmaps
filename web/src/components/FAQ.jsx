import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
  } from "@/components/ui/accordion"

export default function FAQ() {
    return (
        <>
            <div className="container">
                <section className="mx-auto flex max-w-[980px] flex-col items-center gap-2 py-24 md:py-72 lg:py-48 lg:pb-20">
					<h1 className="text-center lg:text-4xl md:text-3xl text-2xl font-bold">FAQ</h1>
					<Accordion type="single" collapsible className="w-full">
						<AccordionItem value="item-1">
							<AccordionTrigger>Can I download maps and mods for free?</AccordionTrigger>
							<AccordionContent>
								Yes. All projects are free to download and use. In the future, we might add a way for creators to monetize their projects.
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="item-2">
							<AccordionTrigger>Where can I install the official plugin?</AccordionTrigger>
							<AccordionContent>
								{/* todo */}
								<p>You can follow the instrucitons from the official GitHub repository: <a href="https://github.com/pageuplt/CRLMPlugin" target="_blank" rel="noreferrer"
									className='underline'
								>GitHub</a></p>
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="item-3">
							<AccordionTrigger>Where can I reach support?</AccordionTrigger>
							<AccordionContent>
								<p>You can contact us via <a href="mailto:support@customrlmaps.com"
									className='underline'
								>Email</a></p>
								<p>
									{/* todo */}
									Or dm @plusleft on {" "}
									<a href="https://discord.com/users/406356211299123201" target="_blank" rel="noreferrer"
										className='underline'
									>Discord</a>
								</p>
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="item-4">
							<AccordionTrigger>I found a bug how to report it?</AccordionTrigger>
							<AccordionContent>
								Report it on the discord server
								<p>Or even better make a github issue <a href="https://github.com/pageuplt/issues/issues/new"
									className='underline'
								>here</a></p>
							</AccordionContent>
						</AccordionItem>
						<AccordionItem value="item-5">
							<AccordionTrigger>Reporting a vulnerability?</AccordionTrigger>
							<AccordionContent>
								<p>You can contact us via <a href="mailto:bugs@customrlmaps.com"
									className='underline'
								>Email</a></p>
								<p>Or even better make a github advisory draft <a href="https://github.com/pageuplt/issues/security/advisories/new"
									className='underline'
								>Email</a></p>
							</AccordionContent>
						</AccordionItem>
    				</Accordion>
				</section>
			</div>
        </>
    );
};