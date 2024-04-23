import { Link } from "react-router-dom"
import { Button } from "./ui/button"
import { AddButton } from "./AddButton"
import { useNavigate } from "react-router-dom"
import { NavButton } from "./NavButton"
import { toast } from "sonner"

const { ipcRenderer } = require('electron');

function Navbar() {
    const navigate = useNavigate()

    ipcRenderer.on('flashError', (event, arg) => {
        toast.error(arg)
    });

    return (
        <>
            <header className='text-primary body-font bg-primary-foreground shadow'>
                <div className='mx-auto flex flex-wrap p-2 flex-row md:flex-row items-center justify-between ml-3 mr-3'>
                    <div className='flex flex-row items-center space-x-2'>
					    <NavButton />
                        {/* icon too // todo */}
                        <Button variant='hero' onClick={() => {
                            navigate('/')
                        }}>
                            CustomRLMaps
                        </Button>
                        
                        <div className='hidden md:flex'>
                        </div>
                    </div>
                    <div className='md:flex items-center space-x-2 flex-row flex'>
                        <div className='hidden md:flex'>
                            <AddButton />
                        </div>
                        {/* todo logging in later */}
                    </div>
                </div>
            </header>
        </>
    )
}

export default Navbar