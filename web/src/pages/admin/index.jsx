import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { getConfig } from "@/lib/config";
import { getAllUserInfoServer, isAdmin } from "@/utils/userUtilsServer";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const getServerSideProps = async ({ req, res }) => {
	const user = await getAllUserInfoServer(req, res);

	if (!user.session || !user.dbUser) {
		return {
			notFound: true,
		};
	}

	if (!isAdmin(user)) {
		return {
			notFound: true,
		};
	}

	const appConfig = await getConfig();

	delete appConfig.id;

	return {
		props: {
			config: appConfig,
		},
	};
}

export default function Admin({ config }) {
	const [newConfig, setNewConfig] = useState(config);

	function updateConfig() {
		toast.loading("Updating config", { dismissible: true });
		fetch("/api/admin/updateConfig", {
			method: "POST",
			body: JSON.stringify({
				...newConfig,
			}),
		}).then((res) => {
			toast.dismiss();
			if (res.ok) {
				toast.success("Config updated");
			} else {
				toast.error("Failed to update config");
			}
		});
	}

	useEffect(() => {
		updateConfig();
	}, [newConfig]);

	return (
		<>
			<div className="container p-4">
				<Card className="w-full">

					<CardHeader className="flex flex-col">
                        <CardTitle>
							Admin console
                        </CardTitle>
                    </CardHeader>

					<CardContent>
						<div className="flex flex-row space-x-4">
							<Button asChild>
								<Link href="/admin/users">
									Users
								</Link>
							</Button>
							<Button asChild>
								<Link href="/admin/projects">
									Projects
								</Link>
							</Button>
						</div>

						<div className="flex flex-col space-y-4 mt-4">
							{Object.keys(newConfig).map((key) => {
								return (
									<div key={key} className="flex flex-col">
										<Label>{key}</Label>
										<Switch
											checked={newConfig[key]}
											onCheckedChange={() => {
												setNewConfig({
													...newConfig,
													[key]: !newConfig[key],
												});
											}}
										/>
									</div>
								);
							}
							)}
						</div>

						<Button onClick={() => updateConfig()} className="mt-4">
							Update config
						</Button>

					</CardContent>
				</Card>
			</div>
		</>
	);
}