import psycopg2

# Data to be inserted
data = ('2025-05-25 08:55:00+07', 1, 30, 60)

# SQL INSERT statement
insert_query = """INSERT INTO sensor_data 
                (time, sensor_id, temperature, humidity) 
                VALUES (%s, %s, %s, %s);"""

CONNECTION = "postgres://postgres:password@localhost:30000/postgres"
with psycopg2.connect(CONNECTION) as conn:
    with conn.cursor() as cur: # use the cursor to interact with your database
        cur.execute(insert_query, data)
    conn.commit()       # commit changes to the database to make changes persistent
print(f"Inserted row: {data}")