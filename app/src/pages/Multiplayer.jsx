import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { set } from 'date-fns';
import { useState } from 'react';
import { Form, Link } from 'react-router-dom';

function Mutiplayer() {

	const [joinString, setJoinString] = useState('');
	const [copiedTimeout, setCopiedTimeout] = useState(null);
	const [serverStarting, setServerStarting] = useState(false);
	const [serverOnline, setServerOnline] = useState(false);

	function joinServer(joinString) {
	}

	async function hostServer() {
		setServerStarting(true);
		await require("electron").ipcRenderer.invoke("hostServer");
		require("electron").ipcRenderer.once("serverId", (event, arg) => {
			setJoinString(arg);
			setServerStarting(false);
			setServerOnline(true);
		});
	}

	async function stopServer() {
		await require("electron").ipcRenderer.invoke("stopServer");
		setServerOnline(false);
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
											<Button onClick={stopServer} disabled={!serverOnline}>
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
