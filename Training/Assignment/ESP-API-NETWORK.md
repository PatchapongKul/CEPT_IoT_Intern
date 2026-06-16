# Full-Stack IoT System Design: Lab Assignment
Assigned Date: 16 June 2026

---

## Part 1: ESP32 Firmware Architecture
Your objective is to build a robust, fault-tolerant embedded application utilizing real-time operating system principles. 

* **Concurrency & Task Management:** Design a Data Flow or State Machine diagram illustrating your system architecture. You must use FreeRTOS tasks and FIFO queues to transfer data safely and prevent data racing.
* **Preemptive Prioritization:** Define strict task priorities. Routine sensor data should be published at a constant interval. Critical events (e.g., High Temperature Detection) must preempt routine tasks to publish immediate alarms to a dedicated MQTT topic.
* **Fault Tolerance & Recovery:** Design and document your error-handling routines. 
    * *Network Loss:* How will your system handle offline data if the ESP32 loses its network or broker connection?
    * *Task Lockup:* Implement Task Watchdog Timers (TWDT) to escape and recover from stuck tasks or infinite loops.
* **Remote Management:** Configure your device partition table to support Over-The-Air (OTA) updates, allowing new firmware to be flashed wirelessly over the network.

---

## Part 2: Time-Series Database & API Design
Your objective is to design the backend infrastructure to store, retrieve, and analyze high-frequency telemetry data.

### 1. Database Schema Initialization
Create a mockup database with the following table structures. Populate `meter_data` with data at 1-minute intervals spanning 2 days across 3 distinct devices.

**Table: `meter_data`**

| Timestamp | device_id | voltage | current |
| :--- | :--- | :--- | :--- |
| *(e.g., 2026-06-16 12:00:00)* | *(e.g., meter_01)* | | |

**Table: `device_info`** *(1 row per device)*

| device_id | location | status |
| :--- | :--- | :--- |
| *(e.g., meter_01)* | *(e.g., building_01)* | *(e.g., active, inactive)* |

### 2. REST API Endpoints
Design and implement the following API routes. **You may design additional routes as needed**.

* **`GET /record`**
    * **Description:** Return all records from the database.
* **`GET /record/{sensor_id}`**
    * **Input:** `{"target_device": "xxx"}`
    * **Output:** Return all historical records for that specific sensor ID.
* **`GET /record/last_record`**
    * **Input:** `{"target_devices": ["xxx", "yyy"]}`
    * **Output:** Return only the most recent telemetry reading for the requested sensor IDs.
* **`GET /record/sensor_range`**
    * **Input:** `{"target_device": "xxx", "start_time": "YYYY-MM-DD HH:MM:SS", "end_time": "YYYY-MM-DD HH:MM:SS"}`
    * **Output:** Return all records for the specified sensor within the designated time window.
* **`GET /record/sensor_range/last_record`**
    * **Input:** `{"target_devices": ["xxx", "yyy"], "start_time": "...", "end_time": "..."}`
    * **Output:** Return the last recorded value for the requested sensors within that specific time window.
* **`GET /record/sensor_resampling`**
    * **Description:** Downsample high-frequency data into aggregated time buckets.
    * **Input Payload:**
        ```json
        {
            "target_device": "meter_01",
            "start_time": "2026-06-16 12:00:00", 
            "end_time": "2026-06-16 14:00:01", 
            "resolution": "1h"
        }
        ```
    * **Expected Output Payload:**
        ```json
        {
          "target_device": "meter_01",
          "location": "building_01",
          "resolution": "1h",
          "data": [
            {"time": "2026-06-16 12:00:00", "avg_power_kw": 42.1, "max_voltage": 232.0},
            {"time": "2026-06-16 13:00:00", "avg_power_kw": 52.0, "max_voltage": 230.9},
            {"time": "2026-06-16 14:00:00", "avg_power_kw": 46.5, "max_voltage": 229.5}
          ]
        }
        ```

---

## Part 3: Edge Network Infrastructure
Your objective is to configure a secure, segmented enterprise network for the physical IoT testbed.

1.  **Architecture:** Design and document the physical and logical network topology for the testbed.
2.  **Interface Binding:** Map the physical router interfaces to specific network zones. *(Example: Port 1 → WAN, Ports 2 & 3 → LAN, Port 4 → Management, Wireless → IoT).*
3.  **Layer 2 Segmentation:** Configure distinct VLANs for each internal interface. Plug a physical device into each port to verify it receives the correct DHCP lease and is isolated to the correct VLAN.
4.  **Layer 3 Routing:** Apply inter-VLAN routing rules to permit necessary traffic between segmented networks.
5.  **Edge Security (Firewall):** Implement strict firewall policies to isolate the management plane. Ensure that the router's Web UI is *only* accessible from a device physically connected to the Management interface.
6.  **Packet Diagnostics:** Establish an SSH connection to the router via the Management interface. Use a packet analyzer like `tcpdump` (you may need to install this package first) to capture active traffic. Export and inspect the `.pcap` file using Wireshark to verify routing behavior.