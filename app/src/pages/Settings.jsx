import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { toast } from 'sonner';

function Settings() {

	const [updating, setUpdating] = useState(false);

	return (
		<>
			<div>
				<Button onClick={() => {
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
				>Update multiplayer</Button>
			</div>
		</>
	)
}

export default Settings
