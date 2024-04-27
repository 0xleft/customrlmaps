import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { toast } from 'sonner';

const { ipcRenderer } = require('electron');

function Settings() {

	const [updating, setUpdating] = useState(false);
	const [projectFolder, setProjectFolder] = useState("loading...");

	useEffect(() => {
		ipcRenderer.invoke("getProjectFolder").then((res) => {
			setProjectFolder(res);
		});
	}, []);

	return (
		<>
			<div className='container p-4'>
				{/* <Button onClick={() => {
					setUpdating(true);
					toast.loading("Updating...", { dismissible: true })
					require("electron").ipcRenderer.invoke("updateBM").then((res) => {
						setUpdating(false);
						toast.dismiss();
						if (!res) {
							toast.error("Failed to update BM.");
							return;
						}
						toast.success("Updated!");
					});
				}}
					disabled={updating}
				>Update multiplayer</Button> */}
				<h1>Project folder: {projectFolder}</h1>
				<h1>Version: 0.0.1</h1>
				<h1>Author: plusleft</h1>
			</div>
		</>
	)
}

export default Settings
