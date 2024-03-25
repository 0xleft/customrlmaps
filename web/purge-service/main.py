# connect to postgresql database
import psycopg2
from dotenvit import DotEnvIt
from boto3.session import Session
import weehok.weehok
import time

dotenv = DotEnvIt()

webhook = weehok.weehok.DiscordHook(dotenv["WEBHOOK_URL"])
webhook.set_username("Purge Service")

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

def purge():
    conn = connect()
    if conn is None:
        return
    
    cur = conn.cursor()

    cur.execute('SELECT * FROM "Version" where deleted = true;')
    rows = cur.fetchall()
    to_delete = [row[3].replace("https://customrlmaps.s3.amazonaws.com/", "") for row in rows]

    if len(to_delete) > 0:
        response = customrlmapsBucket.delete_objects(
            Delete={
                'Objects': [{'Key': key} for key in to_delete],
                'Quiet': False
            }
        )

        cur.execute('DELETE FROM "Version" where deleted = true;')
        conn.commit()


    cur.execute('SELECT * FROM "Project" where deleted = true;')
    rows = cur.fetchall()
    to_delete = [(row[0], row[5].replace("https://customrlmaps.s3.amazonaws.com/", "")) for row in rows]
    
    if len(to_delete) > 0:
        response = customrlmapsBucket.delete_objects(
            Delete={
                'Objects': [{'Key': key[1]} for key in to_delete],
                'Quiet': False
            }
        )

        for key in to_delete:
            # delete ratings
            cur.execute('DELETE FROM "Rating" where "ProjectId" = %s;', (key[0],))
            # delete versions
            cur.execute('DELETE FROM "Version" where "ProjectId" = %s;', (key[0],))

        cur.execute('DELETE FROM "Project" where deleted = true;')
        conn.commit()

    close(conn)

if __name__ == '__main__':
    try:
        purge()
    except Exception as e:
        webhook.set_content("Purge service failed: ")
        webhook.add_embed(embed=weehok.weehok.Embed().add_field(name="Error", value=str(e), inline=False))
        webhook.send()
        print(e)
        print('Purge failed')
    
    # one hour
    time.sleep(3600)