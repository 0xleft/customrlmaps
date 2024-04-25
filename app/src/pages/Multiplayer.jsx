import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { set } from 'date-fns';
const { ipcRenderer, clipboard } = require('electron');
import { useState } from 'react';
import { Form, Link } from 'react-router-dom';
import { toast } from 'sonner';

function Mutiplayer() {

	const [joinString, setJoinString] = useState('');
	const [serverOnline, setServerOnline] = useState(false);
	const [connecting, setConnecting] = useState(false);
	const [connected, setConnected] = useState(false);

	ipcRenderer.on('connected', (event, arg) => {
		setConnecting(false);
		toast.success("Connected successfully.");
		setConnected(true);
	});

	ipcRenderer.on('disconnected', (event, arg) => {
		setConnecting(false);
		toast.error("Disconnected unexpectedly.");
		setConnected(false);
	});

	// naming is confusing af
	function joinServer(joinString) {
		setConnecting(true);
		toast.loading("Joining server...", { dismissible: true })
		ipcRenderer.invoke("joinServer", joinString).then((res) => {
			toast.dismiss();
		});
	}

	function connectLocalhost() {
		toast.loading("Connecting to localhost...", { dismissible: true })
		ipcRenderer.invoke("connectToLocalhost").then((res) => {
			toast.dismiss();
			if (!res) {
				toast.error("Failed to connect to localhost. Make sure BakkesMod is installed and running. (should be done automaticaly by CRLM)");
				return;
			}

			toast.success("Connected to localhost!");
		});
	}

	async function hostServer() {
		toast.loading("Starting server...", { dismissible: true })
		await ipcRenderer.invoke("hostServer");
		ipcRenderer.once("serverId", (event, arg) => {
			setJoinString(arg);
			setServerOnline(true);
			toast.dismiss();
			toast.success("Server started!");
		});
	}

	async function stopServer() {
		toast.loading("Stopping server...", { dismissible: true })
		await ipcRenderer.invoke("stopServer");
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
									shell.openExternal("https://docs.customrlmaps.com/multiplayer")
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
											<Button onClick={hostServer} className='' disabled={serverOnline}>
												{serverOnline ? "Server online" : "Start server"}
											</Button>
											<Button onClick={stopServer}>
												Stop server
											</Button>
										</div>
										
										<div className='flex flex-row space-x-2'>
											<Input value={joinString} onChange={(e) => setJoinString(e.target.value)} placeholder='ID' disabled />
											<Button onClick={() => {
												clipboard.writeText(joinString);
												toast.success("Copied server ID to clipboard!");
											}}>
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
											<Button onClick={() => joinServer(joinString)} disabled={serverOnline || connecting}>
												{connecting ? "Connecting..." : "Connect"}
											</Button>
											<Button onClick={connectLocalhost} disabled={serverOnline || !connected}>
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
