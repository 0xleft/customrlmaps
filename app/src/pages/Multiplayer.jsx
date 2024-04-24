import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { set } from 'date-fns';
import { useState } from 'react';
import { Form, Link } from 'react-router-dom';
import { toast } from 'sonner';

function Mutiplayer() {

	const [joinString, setJoinString] = useState('');
	const [copiedTimeout, setCopiedTimeout] = useState(null);
	const [serverStarting, setServerStarting] = useState(false);
	const [serverOnline, setServerOnline] = useState(false);

	function joinServer(joinString) {
		toast.loading("Joining server...", { dismissible: true })
		require("electron").ipcRenderer.invoke("joinServer", joinString).then((res) => {
			toast.dismiss();
			if (!res) {
				toast.error("Failed to join server. Make sure Rocket League is running.");
				return;
			}

			toast.success("Joined server!");			
		});
	}

	function connectLocalhost() {
		toast.loading("Connecting to localhost...", { dismissible: true })
		require("electron").ipcRenderer.invoke("connectToLocalhost").then((res) => {
			toast.dismiss();
			if (!res) {
				toast.error("Failed to connect to localhost. Make sure BakkesMod is installed and running.");
				return;
			}

			toast.success("Connected to localhost!");
		});
	}

	async function hostServer() {
		setServerStarting(true);
		toast.loading("Starting server...", { dismissible: true })
		await require("electron").ipcRenderer.invoke("hostServer");
		require("electron").ipcRenderer.once("serverId", (event, arg) => {
			setJoinString(arg);
			setServerStarting(false);
			setServerOnline(true);
			toast.dismiss();
			toast.success("Server started!");
		});
	}

	async function stopServer() {
		toast.loading("Stopping server...", { dismissible: true })
		await require("electron").ipcRenderer.invoke("stopServer");
		setServerOnline(false);
		toast.dismiss();
		toast.success("Server stopped!");
	}

	return (
		<>
			<div className="container p-4">
				<Card className="w-full">
					<CardHeader className="w-full">
						<CardTitle className="flex flex-row space-x-2 items-center w-full">
							Multiplayer
						</CardTitle>
						<CardDescription className="w-full">
							<p>
								Documentation for the multiplayer features can be found <Link className='hover:underline font-bold'
								onClick={() => {
									require("electron").shell.openExternal("https://docs.customrlmaps.com/multiplayer")
								}}>here</Link>.
							</p>
						</CardDescription>

					</CardHeader>

					<CardContent>
						<div className='flex flex-row min-h-screen space-x-4'>
							<div className='w-full'>
								<Card className='w-full'>
									<CardHeader className='w-full'>
										<CardTitle className='w-full'>
											<h1 className='text-2xl'>
												Host a server
											</h1>
										</CardTitle>
									</CardHeader>

									<CardContent className="flex flex-col space-y-2">
										<div className='flex flex-row space-x-2'>
											<Button onClick={hostServer} className='' disabled={serverStarting || serverOnline}>
												{serverStarting ? <> Starting server... </> : <> Start server </>}
											</Button>
											<Button onClick={stopServer}>
												Stop server
											</Button>
										</div>
										
										<div className='flex flex-row space-x-2'>
											<Input value={joinString} onChange={(e) => setJoinString(e.target.value)} placeholder='ID' disabled />
											<Button onClick={() => {
												require("electron").clipboard.writeText(joinString);
												clearTimeout(copiedTimeout);
												setCopiedTimeout(setTimeout(() => {
													setCopiedTimeout(null);
												}, 1000));
											}} disabled={copiedTimeout !== null}>
												Copy
											</Button>
										</div>
									</CardContent>

								</Card>
							</div>
							<div className='w-full'>
								<Card className='w-full'>
									<CardHeader className='w-full'>
										<CardTitle className='w-full'>
											<h1 className='text-2xl'>
												Join a server
											</h1>
										</CardTitle>
									</CardHeader>

									<CardContent>
										<div className='flex flex-row space-x-2'>
											<Input value={joinString} onChange={(e) => setJoinString(e.target.value)} placeholder='ID' disabled={serverOnline} />
											<Button onClick={() => joinServer(joinString)}>
												Connect
											</Button>
											<Button onClick={connectLocalhost}>
												Join
											</Button>
										</div>
									</CardContent>
								</Card>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</>
	)
}

export default Mutiplayer
