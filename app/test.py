import sys, os, shutil, websockets, time
import asyncio

bakkesmod_server = 'ws://127.0.0.1:9002'
swap_file = ""

def find_rcon_password():
    # open %appdata%/bakkesmod/cfg/config.cfg
    with open(os.getenv('APPDATA') + '/bakkesmod/bakkesmod/cfg/config.cfg') as f:
        for line in f:
            if 'rcon_password' in line:
                return line.split(' ')[1].strip()
            
    return None

def update_allowed_commands():
    with open(os.getenv('APPDATA') + '/bakkesmod/bakkesmod/data/rcon_commands.cfg', "r+") as f:
        if ('unreal_command' in f.read()):
            return None

        f.write('\nunreal_command')

    return None

def unupdate_allowed_commands():
    with open(os.getenv('APPDATA') + '/bakkesmod/bakkesmod/data/rcon_commands.cfg', "r+") as f:
        lines = f.readlines()
        f.seek(0)
        for line in lines:
            if line.strip() != 'unreal_command':
                f.write(line)
        f.truncate()

    return None

async def main_loop():
    async with websockets.connect(bakkesmod_server, timeout=.1) as websocket:
        update_allowed_commands()
        await websocket.send('rcon_password ' + find_rcon_password())
        auth_status = await websocket.recv()
        assert auth_status == 'authyes'

        await websocket.send("rcon_refresh_allowed")
        time.sleep(0.1)
        await websocket.send("unreal_command \"start 127.0.0.1:7777/?Lan?Password=CRLM\"")
        time.sleep(0.1)
        unupdate_allowed_commands()
        await websocket.send("rcon_refresh_allowed")

if __name__ == '__main__':
	asyncio.get_event_loop().run_until_complete(main_loop())