from synchrophasor.pdc_udp import PdcUdp
from synchrophasor.frame import DataFrame
import json
from kafka import KafkaProducer
from kafka.errors import KafkaError
import math

"""
tinyPDC_udp will connect to pmu_ip:pmu_port using UDP and send request
for header message, configuration and eventually
to start sending measurements.
"""

if __name__ == "__main__":

    pdc = PdcUdp(pdc_id=1, pmu_ip="192.168.38.10", pmu_port=4712)
    pdc.logger.setLevel("DEBUG")

    pdc.run()  # Create UDP socket

    #header = pdc.get_header()
    #print("Header:", header.get_header())

    config = pdc.get_config()
    print("Station Name:", config.get_station_name())
    print("ID Code:", config.get_stream_id_code())
    print("Data Format:", config.get_data_format())
    print("Phasor Num:", config.get_phasor_num())
    print("Analog Num:", config.get_analog_num())
    print("Digital Num:", config.get_digital_num())
    print("Channel Names:", config.get_channel_names())
    print("Phasor Units:", config.get_ph_units())
    print("Analog Units:", config.get_analog_units())
    print("Digital Units:", config.get_digital_units())
    print("Nominal Frequency:", config.get_fnom())
    print("Config Change Count:", config.get_cfg_count())
    print("Data Rate:", config.get_data_rate())
    
    pdc.start()  # Request to start sending measurements

    # while True:
    #     data = pdc.get()  # Keep receiving data

    #     if type(data) == DataFrame:
    #         print(data.get_measurements())

    #     if not data:
    #         pdc.quit()  # Close socket
    #         break

    try:
        while True:

            data = pdc.get()  # Keep receiving data

            if type(data) == DataFrame:
                print(data.get_measurements())
                print(round(round(data.get_measurements()["time"]/0.02) * 0.02, 2))

                producer = KafkaProducer(
                    bootstrap_servers = "192.168.38.136:9092",
                    value_serializer=lambda m: json.dumps(m).encode('ascii')
                )

                topic = "gridPMU"

                def on_success(metadata):
                    print(f"Message produced to topic '{metadata.topic}' at offset {metadata.offset}")

                def on_error(e):
                    print(f"Error sending message: {e}")

                # Produce asynchronously with callbacks
                pmu_data = data.get_measurements()
                pmu_id   = pmu_data["pmu_id"]
                tstamp   = round(round(pmu_data["time"]/0.02) * 0.02, 2)          # avoid shadowing built‑in name `time`
                m0, m1, m2 = pmu_data["measurements"]  # unpack the three phases

                def active_power(V_mag, V_ang_deg, I_mag, I_ang_deg):
                    angle_diff_rad = math.radians(V_ang_deg - I_ang_deg)
                    return V_mag * I_mag * math.cos(angle_diff_rad)
                def reactive_power(V_mag, V_ang_deg, I_mag, I_ang_deg):
                    angle_diff_rad = math.radians(V_ang_deg - I_ang_deg)
                    return V_mag * I_mag * math.sin(angle_diff_rad)
                
                Pa = active_power(m0["phasors"][0][0], m0["phasors"][0][1], m0["phasors"][1][0], m0["phasors"][1][1])
                Pb = active_power(m1["phasors"][0][0], m1["phasors"][0][1], m1["phasors"][1][0], m1["phasors"][1][1])
                Pc = active_power(m2["phasors"][0][0], m2["phasors"][0][1], m2["phasors"][1][0], m2["phasors"][1][1])
                Qa = reactive_power(m0["phasors"][0][0], m0["phasors"][0][1], m0["phasors"][1][0], m0["phasors"][1][1])
                Qb = reactive_power(m1["phasors"][0][0], m1["phasors"][0][1], m1["phasors"][1][0], m1["phasors"][1][1])
                Qc = reactive_power(m2["phasors"][0][0], m2["phasors"][0][1], m2["phasors"][1][0], m2["phasors"][1][1])

                P_total = Pa + Pb + Pc
                Q_total = Qa + Qb + Qc
                
                msg = {"pmu_id": pmu_id, "time": tstamp,
                       "stream_id_a": m0["stream_id"],
                       "stream_id_b": m1["stream_id"],
                       "stream_id_c": m2["stream_id"],
                       "stat_a": m0["stat"],
                       "stat_b": m1["stat"],
                       "stat_c": m2["stat"],
                       "va_mag": m0["phasors"][0][0],
                       "vb_mag": m1["phasors"][0][0],
                       "vc_mag": m2["phasors"][0][0],
                       "va_ang": m0["phasors"][0][1],
                       "vb_ang": m1["phasors"][0][1],
                       "vc_ang": m2["phasors"][0][1],
                       "ia_mag": m0["phasors"][1][0],
                       "ib_mag": m1["phasors"][1][0],
                       "ic_mag": m2["phasors"][1][0],
                       "ia_ang": m0["phasors"][1][1],
                       "ib_ang": m1["phasors"][1][1],
                       "ic_ang": m2["phasors"][1][1],
                       "frequency_a": m0["frequency"],
                       "frequency_b": m1["frequency"],
                       "frequency_c": m2["frequency"],
                       "rocof_a": m0["rocof"],
                       "rocof_b": m1["rocof"],
                       "rocof_c": m2["rocof"],
                       "Pa": Pa,
                       "Pb": Pb,
                       "Pc": Pc,
                       "Qa": Qa,
                       "Qb": Qb,
                       "Qc": Qc,
                       "P_total": P_total,
                       "Q_total": Q_total,
                       }
                
                future = producer.send(topic, msg)
                future.add_callback(on_success)
                future.add_errback(on_error)


            elif data is None:
                print("No data received. Waiting...")
                continue  # Keep running even if no data momentarily
        
    except KeyboardInterrupt:
        print("Stopping PDC...")

    finally:
        pdc.quit()
        producer.flush()
        producer.close()     