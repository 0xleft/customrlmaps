# connect to postgresql database
import psycopg2
from dotenvit import DotEnvIt
from boto3.session import Session
import weehok.weehok
import time
import requests
import hashlib
import zipfile
import os

dotenv = DotEnvIt()

webhook = weehok.weehok.DiscordHook(dotenv["WEBHOOK_URL"])
webhook.set_username("Validity Service")

session = Session(
    aws_access_key_id=dotenv['AWS_ACCESS_KEY_ID'],
    aws_secret_access_key=dotenv['AWS_SECRET_ACCESS_KEY']
)

s3_resource = session.resource('s3')
customrlmapsBucket = s3_resource.Bucket("customrlmaps")

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

        response = requests.get(link)
        if response.status_code == 200:
            with open(f'{filename}.zip', 'wb') as file:
                file.write(response.content)
        else:
            print('Failed to download the file')
            continue

        with zipfile.ZipFile(f'{filename}.zip', 'r') as zip_ref:
            if not any(file.endswith('.upk') for file in zip_ref.namelist()):
                print('Zip file does not contain .upk file')
                # delete the version from the database
                cur.execute('DELETE FROM "Version" WHERE id = %s', (id,))
                conn.commit()
                zip_ref.close()
                os.remove(f'{filename}.zip')
                # todo send email to owner if deleted
                continue

        cur.execute('UPDATE "Version" SET checked = true WHERE id = %s', (id,))
        conn.commit()
        os.remove(f'{filename}.zip')

def checkmods(mods):
    pass

def validate():
    # get all versions that have checked = false
    conn = connect()
    cur = conn.cursor()
    cur.execute('SELECT * FROM "Version" WHERE checked = false')
    rows = cur.fetchall()

    # sort out maps and mods but later
    checkmaps(cur, conn, rows)

if __name__ == '__main__':
    while True:
        validate()
        time.sleep(60)