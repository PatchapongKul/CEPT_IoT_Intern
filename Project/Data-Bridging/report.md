# Background
## Gewertz square project
Infrastructure Under Development: A RE100 Microgrid — a fully renewable energy-based power grid — composed entirely of power electronics-interfaced sources such as rooftop solar PV and Battery Energy Storage Systems (BESS). In the event of a power outage within Chulalongkorn University, the microgrid will switch to islanding operation mode, operating independently to ensure high reliability and resilience of the electrical system in the Gewertz square buildings. 

The project involves connecting the microgrid to the main grid, which requires **synchronization** between the two systems. Therefore, it is necessary to **collect electrical data in real time**.

### Grid and Microgrid Synchronization
Grid and Microgrid Synchronization refers to the process of aligning a microgrid's electrical parameters (such as Voltage, Frequency, and Phase angle) with those of the main utility grid to ensure safe and stable operation when connecting.

When a microgrid reconnects to the main grid (after operating in island mode), the following conditions must match:
- Voltage magnitude
- Frequency
- Phase angle
- Phase sequence

| Synchronizing Parameter                                  | Value         |
|----------------------------------------------------------|---------------|
| Breaker Closing Angle                                    | ± 10°         |
| Generator Side Voltage Difference Relative to System     | 0% to +5%     |
| Frequency Difference                                     | ± 0.067 Hz    |

If these don’t match, it can lead to:
- Power surges
- Equipment damage
- Unstable grid operation

### PMU in Grid–Microgrid Synchronization
Phasor Measurement Units (PMUs) play a key role in ensuring safe and stable synchronization between a microgrid and the main grid. They provide time-synchronized, high-resolution measurements of voltage and current phasors, enabling accurate monitoring and control during grid transitions.

**Key Benefits of PMU Integration**
1. Time-Synchronized Data
PMUs use GPS-based time stamping to provide synchronized phasor data, essential for comparing voltage, frequency, and phase angle between the grid and microgrid.
2. Accurate Parameter Matching
Synchronization requires that voltage, frequency, and phase angle are closely aligned. PMUs enable real-time monitoring to ensure safe connection or reconnection.
3. Fast Fault Detection
With high reporting rates (30–120 samples/second), allowing quick responses to instability.
4. Support for Inverter Control
PMUs enhance the control of inverter-based microgrids by supporting advanced control strategies such as droop control and virtual synchronous operation.
5. Safe Reconnection & Black Start
PMUs facilitate seamless resynchronization after islanding or blackouts by tracking alignment conditions in real time.

### Lab Synchronization (Synchronous Generator)
Study the control of a synchronous generator connected to the power grid. It focuses on synchronization, real power control via mechanical torque, and reactive power control via field current. The **"Dark Lamp Method"** is used for synchronization (A synchronization method using three lamps. When all go dark at once, the generator's voltage matches the grid — indicating the right moment to connect) ,with safety and proper meter usage emphasized.

Lab Simulation from https://perso.univ-lyon1.fr/charles.joubert/web_anim/simen_Pelton_couplee_1.html

![Synchronized_summary](https://github.com/user-attachments/assets/4ca42d7c-28fe-4d93-92c9-b663df7cb976)

When all three lamps go dark simultaneously, it means the voltage from the generator is **equal** in magnitude, frequency, and phase to the grid. At that exact moment, the voltage difference is nearly zero, so **no current flows through the lamps** (I ≈ 0). This ensures a smooth connection without causing **inrush current, arcing, or mechanical stress**, which can damage the generator or system. Synchronizing at any other time would result in a phase mismatch and potentially large circulating currents.

![Synchronized_Lab](https://github.com/user-attachments/assets/ff1ef94a-3b76-484f-893b-13e09f9b8a23)

PMUs relates conceptually. The lab involves phasor-based analysis of voltage, current, and power in synchronous generators. PMUs are designed to measure in real-time. PMUs help monitor synchronization, stability, and power flow in large power systems, exactly the kind of behavior being studied in this experiment.

## Data Bridging project
This project is designed to bridge data from phasor measurement units (PMUs) to Redpanda. The goal is to **facilitate the transfer and processing** of PMU data in a real-time streaming environment.

### Overview
The data bridging process involves extracting PMU data, transforming it into a suitable format, and then loading it into Redpanda for real-time analytics and processing.

![Flowchart_overview](https://github.com/user-attachments/assets/5da8817b-eff8-4645-9adb-77b3dfb353ae)


### Phasor measurement Units (PMUs)
A device used to measure the electrical parameters on an electricity grid in **real-time data**. It sends data over the network in **IEEE C37.118 format.**

> IEEE C37.118: Standard for Synchrophasor Measurements for PMU

### Phasor Data Concentrator (PDC)

A system that collects data from multiple PMUs and aggregates it for further processing or transmission.

### Redpanda
A high-performance streaming platform that is designed for real-time data processing.

> **Choose Redpanda because** we need a Kafka-compatible streaming system with high durability, reliable and performance. Redpanda building a system with stream processing, event sourcing, and real-time analytics with easy to manage interface.


| Feature                          | Redpanda                                                                 | MQTT Broker                                                  |
|----------------------------------|--------------------------------------------------------------------------|--------------------------------------------------------------|
| **Interface**                    | ✅ Built-in web console                                                  | ❌ No built-in GUI (uses external tools)                     |
| **Data Durability**              | ✅ Persistent & Reliable  <br>🗂 Supports data recording and replay for audits or recovery | ❌ Data may be lost if client disconnects                    |
| **Real-time Use Case Compatibility** | ✅ Real-time + analytics                                                 | ✅ Real-time only  <br>❌ No direct analytics support         |


### TimescaleDB
A time-series database built on PostgreSQL that is suitable for real-time data ingestion and querying.

### Grafana
An open-source platform used for data visualization and monitoring.

### WebSocket
A communication protocol that allows two-way, real-time communication between a frontend (browser) and a backend (server) over a single, long-lived connection.

# What we did
### Weekly Progress Summary
| **Week**   | **Date**                             | **Activity Description**                                                                                                                                                                                       |
|------------|-----------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **0** | 15/05/2025                           | **Orientation**: Provided an overview of the internship program and assigned project topics to each group.                                                                                                     |
| **1** | 28/05/2025                           | **Tutorial Session 1**: Introduction to MQTT Communication and ESP32 Programming.                                                                                                                              |
| **2** | 04/06/2025                           | **Tutorial Session 2**: Covered basic Linux commands, database and dashboard setup, Docker, and API server development.                                                                                        |
| **3** | 11/06/2025                           | **Tutorial Session 3**: Introduction to Git and GitHub for version control, and using Node-RED for workflow automation.                                                                                        |
| **4** | 15/06/2025 – 21/06/2025 | Practiced sending data from **pyPMU** and **randomPMU** to **tinyPDC** and subsequently to **Redpanda**. However, sending real PMU data was not yet successful.                                                |
| **5** | 22/06/2025 – 28/06/2025 | Successfully transmitted data to **Redpanda**, processed it into structured orders, and forwarded it to the **database** and **Grafana** for visualization.                                                   |
| **6** | 29/06/2025 – 05/07/2025 | Utilized real-time data from **gridPMU** and **microgridPMU** to compute active (P) and reactive power (Q). The processed data was then sent to the database and Grafana, including phase plot visualizations. |
| **7** | 06/07/2025 – 12/07/2025 | Worked on networking and completed the written report.                                                                                                            |
| **8** | 13/07/2025 – 19/07/2025 | Prepared final presentation materials and Web Dashboard development.                                     |
| **9** | 20/07/2025 – 21/07/2025 | **Pitch Day**: Final project presentations and official conclusion of the internship program.   

### Phasor measurement Units (PMUs)
PMUs measure values such as voltage (V), current (I), Frequency, and Phase angle in real time, and transmit the data using the IEEE C37.118 protocol — the primary standard for PMU data. The information is sent as a binary stream in a frame-based format.

From [microgridPMU](databridge/microgridPMU.py)

### Phasor Data Concentrator (PDC)
To collect and process synchrophasor data, two custom PDCs was developed. They receive real-time data from the microgrid PMU, align measurements to a 20 ms interval based on timestamp, and calculate both active and reactive power for each phase and the total power. The processed data is then forwarded to Redpanda for downstream analytics and visualization.

From [microgridPDC](databridge/microgridPDC.py) We use this code to collect data from microgrid PMU which is the generated data from [microgridPMU](databridge/microgridPMU.py) and produce message to Redpanda in topic "microgridPMU"

From [tinyPDC_udp](databridge/tinyPDC_udp.py) We use this code to collect data from grid PMU which get the real data from a PMU device and produce message to Redpanda in topic "gridPMU".

From
```
producer = KafkaProducer(
    bootstrap_servers = "192.168.38.136:9092" 
```
change 192.168.38.136 to IP of the device that will be used to run Redpanda 


To align timestamp, we round the time to a 20 ms interval using this code
```
tstamp   = round(round(pmu_data["time"]/0.02) * 0.02, 2) 
```

To calculate active and reactive power of each phase and the total power, we use this function
```
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
```

### Message Queue System
TinyPDC retrieves data → Kafka receives and streams the data → PostgreSQL stores the data for future use.

- **Redpanda**\
A high-throughput, low-latency streaming platform based on a distributed log architecture. It supports real-time data ingestion and processing with strong consistency guarantees, making it suitable for event-driven systems and time-sensitive applications. Its built-in management interface facilitates intuitive data stream monitoring and control, enabling seamless integration within modern data pipelines.

From [microgridPDC](databridge/microgridPDC.py) and [tinyPDC_udp](databridge/tinyPDC_udp.py) `KafkaProducer` send msg to Redpanda
```
# Class that send msg to Redpanda broker
producer = KafkaProducer(     
    # Redpanda broker 
    bootstrap_servers = "192.168.38.136:9092", 
    # Redpanda broker ip      
    value_serializer=lambda m: json.dumps(m).encode('ascii')
        )
```

From [docker-compose.yml](/databridge/docker-redpanda/docker-compose.yml) Change localhost to Network ip at port 9092 (Kafka broker)

contains two key services:\
**redpanda-broker** : \
image: redpandadata/redpanda:v25.1.4  \
**redpanda-console** : \
image: redpandadata/console:v3.1.1 \
depends on: redpanda-broker

```
localhost: 9092 # change localhost to Network ip
192.168.38.136: 9092
```
- **Consumer**\
The consumer layer in this system is responsible for retrieving PMU (Phasor Measurement Unit) data, transforming it, and storing it in a Time-Series database (TimescaleDB). Two main data sources—Grid PMU and Microgrid PMU—are consumed via Kafka, processed, and persisted for real-time analytics and visualization in Grafana.

    - **Docker Database & Dashboard**\
    The [docker-compose.yml](/databridge/docker-database/docker-compose.yml) contains two key services:
        - **TimescaleDB**
            - image: timescale/timescaledb:2.20.0-pg17
        - **Grafana**
            - image: grafana/grafana-oss
            - depends on:  Ensure TimescaleDB starts before Grafana
        ```
        #version: '3'
        services:
        timescaledb:
            image: timescale/timescaledb:2.20.0-pg17
            ports:
            - "0.0.0.0:30000:5432" 
            environment:
            POSTGRES_PASSWORD: password  

        grafana:
            image: grafana/grafana-oss
            ports:
            - "0.0.0.0:30001:3000"  
            depends_on:
            - timescaledb   # Ensure TimescaleDB starts before Grafana
        ```
    - **Database**\
    This system collects and stores real-time PMU data using Kafka, Python, and TimescaleDB. PMU data is sent to a Kafka topic (gridPMU and microgridPMU), which is consumed by json_consumer_gridPMU.py and json_consumer_microgridPMU.py.The script extracts electrical measurements from each JSON message and inserts them into a TimescaleDB table (randomPMU3p) running in a Docker container.
        - 1. Navigate to the folder with docker-compose.yml by running following command in the terminal (Visual Studio code)
        ```
        cd <YourDockerComposeFolder>
        ```

        - 2. Run docker-compose.yml by running following command
        ```
        docker compose up -d
        ```
        - 3. In docker open timescaledb container in the Containers tab and go to Exec tab

        - 4. Run this command to connect to database.
        ```
        psql -d "postgres://postgres:password@localhost/postgres"
        ```
        - 5. Create table
        ```
        CREATE TABLE pmu_data (
        pmu_id INTEGER,
        time TIMESTAMPTZ,
        stream_id_a INTEGER,
        stream_id_b INTEGER,
        stream_id_c INTEGER,
        stat_a TEXT,
        stat_b TEXT,
        stat_c TEXT,
        va_mag DOUBLE PRECISION,
        va_ang DOUBLE PRECISION,
        vb_mag DOUBLE PRECISION,
        vb_ang DOUBLE PRECISION,
        vc_mag DOUBLE PRECISION,
        vc_ang DOUBLE PRECISION,
        ia_mag DOUBLE PRECISION,
        ib_mag DOUBLE PRECISION,
        ic_mag DOUBLE PRECISION,
        ia_ang DOUBLE PRECISION,
        ib_ang DOUBLE PRECISION,
        ic_ang DOUBLE PRECISION,
        frequency_a DOUBLE PRECISION,
        frequency_b DOUBLE PRECISION,
        frequency_c DOUBLE PRECISION,
        rocof_a DOUBLE PRECISION,
        rocof_b DOUBLE PRECISION,
        rocof_c DOUBLE PRECISION,
        Pa DOUBLE PRECISION,
        Pb DOUBLE PRECISION,
        Pc DOUBLE PRECISION,
        Qa DOUBLE PRECISION,
        Qb DOUBLE PRECISION,
        Qc DOUBLE PRECISION,
        P_total DOUBLE PRECISION,
        Q_total DOUBLE PRECISION
        );
        ```

    - **JSON Consumer form gridPMU**\
    This Python script acts as a Kafka consumer that subscribes to the topic "gridPMU" and receives real-time JSON-formatted PMU data. It parses each message, converts the timestamp to Bangkok time, and inserts the extracted data into a TimescaleDB table named randomPMU3p.

        
        
        -  **Import libraries**
            - KafkaConsumer : Used to receive data from Kafka.
            - psycopg2 : Used to connect with ProsgreSQL
            - datetime : Convert timestamp to desired timezone.
            ```
            import json
            from kafka import KafkaConsumer
            import psycopg2
            from datetime import datetime,timezone, timedelta
            ```
        - **Create Kafka consumer**
            ```
            consumer = KafkaConsumer(
            bootstrap_servers=["192.168.38.136:9092"], 
            group_id="demo-group",
            auto_offset_reset="earliest",
            enable_auto_commit=False,
            #consumer_timeout_ms=1000,
            value_deserializer=lambda m: json.loads(m.decode('ascii'))
            )
            ```
        - **Subscribe and SEt up database connection**
        Subscribe to data from the gridPMU topic and enter the correct PostgreSQL username, password, IP, and port.

        - **Insert data to table**
        ```
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
        ```
        - **Read messages from Kafka and insert into the database**\
        This code acts as a Kafka consumer that continuously listens for PMU data messages from the "gridPMU" topic. Each message is a JSON object containing various measurement values. The program extracts these values, converts the timestamp to Bangkok local time, and then inserts the data into a TimescaleDB table named randomPMU3p for further analysis and visualization.

    For [json_comsumer_microgridPMU](databridge/json_comsumer_microgridPMU.py)

    The code in this section works the same as in the JSON consumer gridPMU file, except that the Kafka topic is microgridPMU instead of gridPMU.

### Grafana
Grafana is used as the visualization tool to display PMU data stored in a PostgreSQL database. The data source is configured under the name PMU, and a custom SQL query is used to retrieve the most recent three-phase voltage data from two PMUs (pmu_id = 1 and 2). The query selects the latest values for each voltage magnitude (va_mag, vb_mag, vc_mag) and angle (va_ang, vb_ang, vc_ang.)
```
SELECT DISTINCT ON (pmu_id)
    pmu_id, time, va_mag, va_ang,
    vb_mag, vb_ang,
    vc_mag, vc_ang
FROM randompmu3p 
WHERE pmu_id IN (1, 2)
ORDER BY pmu_id, time DESC;
```
For visualization, the Plotly panel plugin is used with a polar coordinate chart to represent voltage phasors. The configuration includes conversion of angles from radians to degrees and plotting both PMU data sets on the same chart for comparison. Solid lines represent PMU 1 (VA, VB, VC) while dotted lines represent PMU 2 (VA2, VB2, VC2).

- **Layout Editor**
```
font:
  family: Inter, Helvetica, Arial, sans-serif
xaxis:
  type: date
  autorange: true
  automargin: true
yaxis:
  autorange: true
  automargin: true
title:
  automargin: true
margin:
  l: 20
  r: 20
  b: 20
  t: 20
polar:
  radialaxis:
    range:
      - 0
      - 300
    tickangle: 45
    tickfont:
      size: 10
```
- **Script Editor**
```
let series = data.series[0];

let va_mag = series.fields.find(f => f.name === 'va_mag').values[0];
let va_ang = series.fields.find(f => f.name === 'va_ang').values[0] * 180 / Math.PI;
let vb_mag = series.fields.find(f => f.name === 'vb_mag').values[0];
let vb_ang = series.fields.find(f => f.name === 'vb_ang').values[0] * 180 / Math.PI;
let vc_mag = series.fields.find(f => f.name === 'vc_mag').values[0];
let vc_ang = series.fields.find(f => f.name === 'vc_ang').values[0] * 180 / Math.PI;

let v2a_mag = series.fields.find(f => f.name === 'va_mag').values[1];
let v2a_ang = series.fields.find(f => f.name === 'va_ang').values[1] * 180 / Math.PI;
let v2b_mag = series.fields.find(f => f.name === 'vb_mag').values[1];
let v2b_ang = series.fields.find(f => f.name === 'vb_ang').values[1] * 180 / Math.PI;
let v2c_mag = series.fields.find(f => f.name === 'vc_mag').values[1];
let v2c_ang = series.fields.find(f => f.name === 'vc_ang').values[1] * 180 / Math.PI;

return {
  data: [
    // VA
    {
      type: 'scatterpolar',
      r: [0, va_mag],
      theta: [0, va_ang],
      mode: 'lines+text',
      line: { width: 3, color: 'red' },
      text: ['', 'VA'],
      textposition: 'top center',
      name: 'VA'
    },
    // VB
    {
      type: 'scatterpolar',
      r: [0, vb_mag],
      theta: [0, vb_ang],
      mode: 'lines+text',
      line: { width: 3, color: 'green' },
      text: ['', 'VB'],
      textposition: 'top center',
      name: 'VB'
    },
    // VC
    {
      type: 'scatterpolar',
      r: [0, vc_mag],
      theta: [0, vc_ang],
      mode: 'lines+text',
      line: { width: 3, color: 'blue' },
      text: ['', 'VC'],
      textposition: 'top center',
      name: 'VC'
    },

    // VA2
    {
      type: 'scatterpolar',
      r: [0, v2a_mag],
      theta: [0, v2a_ang],
      mode: 'lines+text',
      line: { width: 3, color: 'red', dash: 'dot'},
      text: ['', 'VA2'],
      textposition: 'top center',
      name: 'VA2'
    },
    // VB2
    {
      type: 'scatterpolar',
      r: [0, v2b_mag],
      theta: [0, v2b_ang],
      mode: 'lines+text',
      line: { width: 3, color: 'green', dash: 'dot' },
      text: ['', 'VB2'],
      textposition: 'top center',
      name: 'VB2'
    },
    // VC2
    {
      type: 'scatterpolar',
      r: [0, v2c_mag],
      theta: [0, v2c_ang],
      mode: 'lines+text',
      line: { width: 3, color: 'blue', dash: 'dot' },
      text: ['', 'VC2'],
      textposition: 'top center',
      name: 'VC2'
    }
  ]
};
```
---

### WebSocket

- Backend\
The backend system receives data from Kafka sent from both gridPMU and microdgridPMU and sends data in real-time to the frontend via WebSocket. It also has an API for retrieving the latest data and checking the status of the system. The backend works asynchronously to support multiple users connecting smoothly at the same time.


| File              | Description                    |
|-------------------|-------------------------------|
| `data-generator.js`  | Generate mock or PMU data      |
| `server.js`         | Send data via WebSocket        |

From [server.js](kafka-dashboard/backend/server.js) recieve data from redpanda of ip 192.168.38.136 (not localhost)
```
// Kafka configuration
const kafka = new Kafka({
  clientId: 'pmu-dashboard',
  brokers: [process.env.KAFKA_BROKER || '192.168.38.136:9092']
});
```

- WebSocket Connection

| File            | Protocol    | Destination           |
|-------------------|-------------|-----------------------|
| `server.js`         | WebSocket   | Frontend |

- Frontend\
The frontend is developed with React and connects to the backend via WebSocket to display real-time PMU data, including voltage, phase angle, frequency, and a 3-Phase voltage phasor diagram in polar plot format. This allows users to clearly see the difference between grid and microgrid data through the dashboard.

| File                | Description               |
|---------------------|---------------------------|
| `index.js`            | Render App.js              |
| `App.js`              | Main layout                |
| `ConnectionStatus.js`  | Show WebSocket connection status |
| `DataDisplay.js`       | Show live values           |
| `PhasorPlot.js`        | Draw 3-Phase Voltage Phasor Diagram and Realtime data of Grid and Microgrid PMU Data (Va, Vb, Vc) phasor plot by react-plotly.js          |

Frontend apps runs on `localhost:3000`

### System Design
We have divided the system into three separate PCs, each performing specific tasks according to the flowchart:

![Flowchart](https://github.com/user-attachments/assets/3f16267c-f740-4eb4-831d-1c51297dada4)

- **PC 1** collects data from two sources: the Microgrid PMU, which provides measurements of Voltage, Frequency, and Phase Angle, and the Grid PMU, which receives data from the utility grid. This PC functions as a data concentrator, converting raw PMU data into a more readable format and calculating Active power (P), Reactive power (Q), and Apparent power (S) for further analysis.

- **PC 2** is responsible for receiving the processed data from PC 1 (Redpanda). Moreover, it is the connected netwerk IP for PC 1 and PC 3 to collect data.

- **PC 3** stores the received data into a database and displays synchronized measurements through a Grafana Dashboard. Moreover, PC 3 show data from Redpanda to WebSocket.

(It is not necessary to follow this design)

# Result

### 🔹 **Summary**
System successfully implemented a real-time data streaming system that bridges phasor measurements from grid and microgrid PMUs into a robust analytics pipeline.

**System overview :**
```
PMU Data Collection → PDC (20ms sync, P/Q calc) → Redpanda → TimescaleDB → Grafana Dashboard
```
### 🔹 **Demo**
Live Visualization using Grafana dashboards. (Auto-updates every 5 seconds, with potential for faster refresh via **Kafka** plugin integration but not stable.)

![3p_plot](https://github.com/user-attachments/assets/ae2fd916-3aab-4de5-b790-72aca324a0df)
Three-phase voltage data from both PMUs can be shown as tables and time-series plots.

![3p_table](https://github.com/user-attachments/assets/78871771-cdb8-4379-a97b-daf9718ad54b)

Real-time updated Visualization using WebSocket show three-phase Voltage Phasor Diagram, Real-time PMU Data from Grid and Microgrid PMU, Synchronization Analysis (Phase Angle and Magnitude difference).

![WebSocket](https://github.com/user-attachments/assets/e3c7b9ca-9c4c-4c87-847a-cef0559f03b6)

### 🔹 **Project use case next step**
PMU Data Bridge project enables real-time synchronization checks between the grid and microgrid by comparing phasor data from both sides using PMUs. The breaker will open (cut) if the phasor data from the GridPMU and MicrogridPMU are not synchronized to prevent unstable or unsafe grid connection.

![PMU_gewartz](https://github.com/user-attachments/assets/9708f4ec-8fa4-4c63-8fdd-956326c30621)
