import pandas as pd
import psycopg2
from io import StringIO

CSV_FILE = 'solar_load_profile_with_batteries.csv'
TABLE_NAME = 'data'

# Read CSV with pandas
df = pd.read_csv(CSV_FILE, parse_dates=True, infer_datetime_format=True)

# Infer PostgreSQL-compatible data types from pandas dtypes
def infer_pg_type(dtype):
    if pd.api.types.is_datetime64_any_dtype(dtype):
        return "TIMESTAMPTZ"
    elif pd.api.types.is_integer_dtype(dtype):
        return "INTEGER"
    elif pd.api.types.is_float_dtype(dtype):
        return "DOUBLE PRECISION"
    elif pd.api.types.is_bool_dtype(dtype):
        return "BOOLEAN"
    else:
        return "TEXT"

columns = df.columns
pg_types = [infer_pg_type(df[col]) for col in columns]

# Build CREATE TABLE SQL
col_defs = ",\n  ".join([f'"{col}" {typ}' for col, typ in zip(columns, pg_types)])
create_table_sql = f"""
CREATE TABLE IF NOT EXISTS {TABLE_NAME} (
  {col_defs}
);
"""

# Connection info
conn = psycopg2.connect(
    host="172.30.64.1",  # Use container name if running in a different Docker container
    port=30000,
    dbname="postgres",
    user="postgres",
    password="password"
)
cur = conn.cursor()

# Create table
cur.execute(create_table_sql)

# Try to create hypertable using first timestamp column (if any)
for col, typ in zip(columns, pg_types):
    if typ == "TIMESTAMPTZ":
        try:
            cur.execute(f"SELECT create_hypertable('{TABLE_NAME}', '{col}', if_not_exists => TRUE);")
        except Exception as e:
            print(f"Warning: could not create hypertable: {e}")
        break

conn.commit()

# Fast insert using COPY
def copy_from_stringio(df, table):
    buffer = StringIO()
    df.to_csv(buffer, index=False, header=False)
    buffer.seek(0)
    cur.copy_from(buffer, table, sep=",", columns=df.columns)
    conn.commit()

copy_from_stringio(df, TABLE_NAME)

cur.close()
conn.close()