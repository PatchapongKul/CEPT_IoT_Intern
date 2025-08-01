from synchrophasor.pdc_udp import PdcUdp
from synchrophasor.frame import DataFrame
from kafka import KafkaProducer
import json
import math

# ---------------------------------------------------------------------------
# Helper functions
# ---------------------------------------------------------------------------
def average_power(V_mag, V_ang_deg, I_mag, I_ang_deg):
    angle_diff_rad = math.radians(V_ang_deg) - math.radians(I_ang_deg)
    return V_mag * I_mag * math.cos(angle_diff_rad)

def reactive_power(V_mag, V_ang_deg, I_mag, I_ang_deg):
    angle_diff_rad = math.radians(V_ang_deg) - math.radians(I_ang_deg)
    return V_mag * I_mag * math.sin(angle_diff_rad)

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    # --- PDC setup ----------------------------------------------------------
    pdc = PdcUdp(pdc_id=1, pmu_ip="192.168.38.10", pmu_port=4712)
    pdc.logger.setLevel("DEBUG")
    pdc.run()

    cfg = pdc.get_config()              # you can still print cfg info if you like
    pdc.start()                         # start streaming data

    # --- Kafka producer (ONE instance) --------------------------------------
    producer = KafkaProducer(
        bootstrap_servers="localhost:9092",#192.168.38.136
        value_serializer=lambda m: json.dumps(m).encode("ascii"),
    )

    TOPIC_FULL    = "gridPMU"
    TOPIC_PHASORS = "gridPMU_phasors"   # <‑‑ your new topic

    try:
        while True:
            frame = pdc.get()

            # ----------------------------------------------------------------
            # 1. We only care about DataFrames
            # ----------------------------------------------------------------
            if not isinstance(frame, DataFrame):
                if frame is None:
                    print("No data received; waiting …")
                continue

            pmu_data = frame.get_measurements()
            pmu_id   = pmu_data["pmu_id"]
            tstamp   = round(round(pmu_data["time"] / 0.02) * 0.02, 2)

            m0, m1, m2 = pmu_data["measurements"]

            # --- Compute P & Q ---------------------------------------------
            Pa = average_power(*m0["phasors"][0], *m0["phasors"][1])
            Pb = average_power(*m1["phasors"][0], *m1["phasors"][1])
            Pc = average_power(*m2["phasors"][0], *m2["phasors"][1])
            Qa = reactive_power(*m0["phasors"][0], *m0["phasors"][1])
            Qb = reactive_power(*m1["phasors"][0], *m1["phasors"][1])
            Qc = reactive_power(*m2["phasors"][0], *m2["phasors"][1])

            # --- FULL message ----------------------------------------------
            full_msg = {
                "pmu_id": pmu_id,
                "time": tstamp,
                "stream_id_a": m0["stream_id"],
                "stream_id_b": m1["stream_id"],
                "stream_id_c": m2["stream_id"],
                "stat_a": m0["stat"],
                "stat_b": m1["stat"],
                "stat_c": m2["stat"],
                "va_mag": m0["phasors"][0][0], "vb_mag": m1["phasors"][0][0], "vc_mag": m2["phasors"][0][0],
                "va_ang": m0["phasors"][0][1], "vb_ang": m1["phasors"][0][1], "vc_ang": m2["phasors"][0][1],
                "ia_mag": m0["phasors"][1][0], "ib_mag": m1["phasors"][1][0], "ic_mag": m2["phasors"][1][0],
                "ia_ang": m0["phasors"][1][1], "ib_ang": m1["phasors"][1][1], "ic_ang": m2["phasors"][1][1],
                "frequency_a": m0["frequency"], "frequency_b": m1["frequency"], "frequency_c": m2["frequency"],
                "rocof_a": m0["rocof"], "rocof_b": m1["rocof"], "rocof_c": m2["rocof"],
                "Pa": Pa, "Pb": Pb, "Pc": Pc,
                "Qa": Qa, "Qb": Qb, "Qc": Qc,
                "P_total": Pa + Pb + Pc,
                "Q_total": Qa + Qb + Qc,
            }

            # --- PHASOR‑ONLY message ---------------------------------------
            phasor_msg = {
                "pmu_id": pmu_id,
                "time": tstamp,
                "va_mag": m0["phasors"][0][0],
                "vb_mag": m1["phasors"][0][0],
                "vc_mag": m2["phasors"][0][0],
                "va_ang": m0["phasors"][0][1],
                "vb_ang": m1["phasors"][0][1],
                "vc_ang": m2["phasors"][0][1],
            }

            # --- Send both messages ----------------------------------------
            producer.send(TOPIC_FULL,    full_msg)
            producer.send(TOPIC_PHASORS, phasor_msg)

    except KeyboardInterrupt:
        print("Stopping …")

    finally:
        pdc.quit()
        producer.flush()
        producer.close()
