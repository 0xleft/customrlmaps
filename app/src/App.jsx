import { Route, Routes } from 'react-router-dom';
import Settings from './pages/Settings';
import Search from './pages/Search';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Mutiplayer from './pages/Multiplayer';
import { Toaster, toast } from 'sonner';
import Downloaded from './pages/Downloaded';
const { ipcRenderer } = require('electron');

function App() {
	ipcRenderer.on('flashError', (event, arg) => {
        toast.error(arg)
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
		</>
	)
}

export default App
