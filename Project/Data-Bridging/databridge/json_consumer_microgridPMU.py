import json
from kafka import KafkaConsumer
import psycopg2
from datetime import datetime, timezone, timedelta

consumer = KafkaConsumer(
  bootstrap_servers=["192.168.38.136:9092"], #192.168.38.136
  group_id="demo-group",
  auto_offset_reset="earliest",
  enable_auto_commit=False,
  #consumer_timeout_ms=1000,
  value_deserializer=lambda m: json.loads(m.decode('ascii'))
)

consumer.subscribe(["microgridPMU"])

CONNECTION = "postgres://postgres:password@192.168.38.240:30000/postgres" #192.168.38.240

insert_query = """INSERT INTO randomPMU3p 
                (pmu_id, time, 
                stream_id_a, stream_id_b, stream_id_c,
                stat_a, stat_b, stat_c,
                va_mag, vb_mag, vc_mag, 
                va_ang, vb_ang, vc_ang, 
                ia_mag, ib_mag, ic_mag, 
                ia_ang, ib_ang, ic_ang, 
                frequency_a, frequency_b, frequency_c, 
                rocof_a, rocof_b, rocof_c,
                Pa, Pb, Pc,
                Qa, Qb, Qc,
                P_total, Q_total
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s );"""

BANGKOK_TZ = timezone(timedelta(hours=7))

try:
    with psycopg2.connect(CONNECTION) as conn:
        with conn.cursor() as cur:
            for message in consumer:
                topic_info = f"topic: {message.partition}|{message.offset})"
                message_info = f"key: {message.key}, {message.value}"
                print(f"{topic_info}, {message_info}")
                
                data = message.value
                pmu_id = data.get("pmu_id")
                time_unix = data.get("time")
                # Convert UNIX timestamp to Bangkok time
                time = datetime.fromtimestamp(time_unix, tz=BANGKOK_TZ) if time_unix is not None else None
                stream_id_a = data.get("stream_id_a")
                stream_id_b = data.get("stream_id_b")
                stream_id_c = data.get("stream_id_c")
                stat_a = data.get("stat_a")
                stat_b = data.get("stat_b")
                stat_c = data.get("stat_c")
                va_mag = data.get("va_mag")
                vb_mag = data.get("vb_mag")
                vc_mag = data.get("vc_mag")
                va_ang = data.get("va_ang")
                vb_ang = data.get("vb_ang")
                vc_ang = data.get("vc_ang")
                ia_mag = data.get("ia_mag")
                ib_mag = data.get("ib_mag")
                ic_mag = data.get("ic_mag")
                ia_ang = data.get("ia_ang")
                ib_ang = data.get("ib_ang")
                ic_ang = data.get("ic_ang")
                frequency_a = data.get("frequency_a")
                frequency_b = data.get("frequency_b")
                frequency_c = data.get("frequency_c")
                rocof_a = data.get("rocof_a")
                rocof_b = data.get("rocof_b")
                rocof_c = data.get("rocof_c")
                Pa = data.get("Pa")
                Pb = data.get("Pb")
                Pc = data.get("Pc")
                Qa = data.get("Qa")
                Qb = data.get("Qb")
                Qc = data.get("Qc")
                P_total = data.get("P_total")
                Q_total = data.get("Q_total")

                db_row = (
                    pmu_id, time, 
                    stream_id_a, stream_id_b, stream_id_c,
                    stat_a, stat_b, stat_c,
                    va_mag, vb_mag, vc_mag, 
                    va_ang, vb_ang, vc_ang, 
                    ia_mag, ib_mag, ic_mag, 
                    ia_ang, ib_ang, ic_ang, 
                    frequency_a, frequency_b, frequency_c, 
                    rocof_a, rocof_b, rocof_c,
                    Pa, Pb, Pc,
                    Qa, Qb, Qc,
                    P_total, Q_total
                )

                cur.execute(insert_query, db_row)
                conn.commit()
                print(f"Inserted row: {db_row}")

except Exception as e:
    print(f"Error occurred while consuming messages or inserting to DB: {e}")
finally:
    consumer.close()



# CREATE TABLE randomPMU3p (
# pmu_id INTEGER,
# time TIMESTAMPTZ,
# stream_id_a INTEGER,
# stream_id_b INTEGER,
# stream_id_c INTEGER,
# stat_a TEXT,
# stat_b TEXT,
# stat_c TEXT,
# va_mag DOUBLE PRECISION,
# va_ang DOUBLE PRECISION,
# vb_mag DOUBLE PRECISION,
# vb_ang DOUBLE PRECISION,
# vc_mag DOUBLE PRECISION,
# vc_ang DOUBLE PRECISION,
# ia_mag DOUBLE PRECISION,
# ib_mag DOUBLE PRECISION,
# ic_mag DOUBLE PRECISION,
# ia_ang DOUBLE PRECISION,
# ib_ang DOUBLE PRECISION,
# ic_ang DOUBLE PRECISION,
# frequency_a DOUBLE PRECISION,
# frequency_b DOUBLE PRECISION,
# frequency_c DOUBLE PRECISION,
# rocof_a DOUBLE PRECISION,
# rocof_b DOUBLE PRECISION,
# rocof_c DOUBLE PRECISION,
# Pa DOUBLE PRECISION,
# Pb DOUBLE PRECISION,
# Pc DOUBLE PRECISION,
# Qa DOUBLE PRECISION,
# Qb DOUBLE PRECISION,
# Qc DOUBLE PRECISION,
# P_total DOUBLE PRECISION,
# Q_total DOUBLE PRECISION
# );

