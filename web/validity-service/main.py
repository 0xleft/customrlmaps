# connect to postgresql database
import psycopg2
from dotenvit import DotEnvIt
import weehok.weehok
import time
import requests
import hashlib
import zipfile
import os

dotenv = DotEnvIt()

webhook = weehok.weehok.DiscordHook(dotenv["WEBHOOK_URL"])
webhook.set_username("Validity Service")

def connect():
    try:
        conn = psycopg2.connect(
            dbname=dotenv['DB_NAME'],
            user=dotenv['DB_USER'],
            password=dotenv['DB_PASS'],
            host=dotenv['DB_HOST'],
            port=dotenv['DB_PORT']
        )
        return conn
    except Exception as e:
        print(e)
        return None
    
def close(conn):
    conn.close()
    print('Connection closed')

def checkmaps(cur, conn, maps):
    download_links = [(map[0], map[3]) for map in maps]

    for (id, link) in download_links:
        filename = hashlib.md5(link.encode()).hexdigest()

        response = requests.get(f"{dotenv["ACTIVE_HOST"]}{link}", headers={
            "x-local-host-bypass": "true"
        }).json()

        print(response)

        if not response.get("downloadUrl"):
            cur.execute('UPDATE "Version" SET "checkedStatus" = \'DENIED\' WHERE id = %s', (id,))
            cur.execute('UPDATE "Version" SET "checkedMessage" = \'Failed to download (300)\' WHERE id = %s', (id,))
            conn.commit()
            continue

        response = requests.get(response["downloadUrl"])
        if response.status_code == 200:
            with open(f'{filename}.zip', 'wb') as file:
                file.write(response.content)
        else:
            cur.execute('UPDATE "Version" SET "checkedStatus" = \'DENIED\' WHERE id = %s', (id,))
            cur.execute('UPDATE "Version" SET "checkedMessage" = \'Failed to download (200)\' WHERE id = %s', (id,))
            conn.commit()
            continue

        with zipfile.ZipFile(f'{filename}.zip', 'r') as zip_ref:
            upk_files = [file for file in zip_ref.namelist() if file.endswith('.upk')]
            if len(upk_files) != 1:
                # check if id is int by trying to convert it to int # TODO
                print('Zip file does not contain exactly one .upk file')
                cur.execute('UPDATE "Version" SET "checkedStatus" = \'DENIED\' WHERE id = %s', (id,))
                cur.execute('UPDATE "Version" SET "checkedMessage" = \'Zip file does not contain exactly one .upk file\' WHERE id = %s', (id,))
                conn.commit()
                zip_ref.close()
                os.remove(f'{filename}.zip')
                # todo send email to owner if deleted
                continue

        cur.execute('UPDATE "Version" SET "checkedStatus" = \'APPROVED\' WHERE id = %s', (id,))
        conn.commit()
        os.remove(f'{filename}.zip')

def checkmods(mods):
    pass

def validate():
    # get all versions that have checked = false
    conn = connect()
    cur = conn.cursor()
    cur.execute('SELECT * FROM "Version" WHERE "checkedStatus" = \'PENDING\'')
    rows = cur.fetchall()
    print(rows)

    # sort out maps and mods but later
    checkmaps(cur, conn, rows)

if __name__ == '__main__':
    while True:
        try:
            validate()
        except Exception as e:
            webhook.set_content("Validity service failed: ")
            webhook.add_embed(embed=weehok.weehok.Embed().add_field(name="Error", value=str(e), inline=False))
            webhook.send()
        time.sleep(20)
