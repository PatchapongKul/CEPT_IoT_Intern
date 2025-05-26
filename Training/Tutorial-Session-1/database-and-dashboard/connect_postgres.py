import psycopg2

CONNECTION = "postgres://postgres:password@localhost:30000/postgres"
with psycopg2.connect(CONNECTION) as conn:
    with conn.cursor() as cur: # use the cursor to interact with your database
        cur.execute("SELECT version();")
        version = cur.fetchone()
        print(version)