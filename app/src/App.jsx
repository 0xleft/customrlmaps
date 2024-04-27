import { Route, Routes } from 'react-router-dom';
import Settings from './pages/Settings';
import Search from './pages/Search';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Mutiplayer from './pages/Multiplayer';
import { Toaster, toast } from 'sonner';
import Downloaded from './pages/Downloaded';
import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from './components/ui/dialog';
import { Button } from './components/ui/button';
const { ipcRenderer } = require('electron');

function App() {
	ipcRenderer.on('flashError', (event, arg) => {
        toast.error(arg)
    });

	const [updatePopup, setUpdatePopup] = useState(false);

	ipcRenderer.on('updateAvailable', (event, arg) => {
		setUpdatePopup(true);
	});

	return (
		<>
			<Navbar />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/settings" element={<Settings />} />
				<Route path="/search" element={<Search />} />
				<Route path="/downloaded" element={<Downloaded />} />
				<Route path="/multiplayer" element={<Mutiplayer />} />
			</Routes>
			<Toaster />

			{updatePopup && (
				<Dialog open={updatePopup} onClose={() => setUpdatePopup(false)}>
					<DialogTitle>Update available</DialogTitle>
					<DialogContent>
						<p>An update is available for CustomRLMaps. Would you like to update now?</p>
						<Button onClick={() => {
							setUpdatePopup(false);
							ipcRenderer.invoke('update');
						}
						}>Update</Button>
						<Button onClick={() => setUpdatePopup(false)}>Cancel</Button>
					</DialogContent>
				</Dialog>
			)}
		</>
	)
}

export default App
