# Data Bridging from OpenHistorian to Redpanda
This project is designed to bridge data from OpenHistorian to Redpanda, specifically focusing on phasor measurement unit (PMU) data. The goal is to facilitate the transfer and processing of PMU data in a real-time streaming environment.

## Overview
The data bridging process involves extracting PMU data from OpenHistorian, transforming it into a suitable format, and then loading it into Redpanda for real-time analytics and processing.

![Overview Diagram](./Assets/overview_diagram.png)
## Phasor measurement unit (PMU)
PMUs are devices used to measure the electrical waves on an electricity grid. They provide real-time data on the grid's status, which is crucial for monitoring and managing the grid effectively.

## OpenHistorian2
OpenHistorian2 is an open-source time-series data historian designed for high-performance data ingestion and retrieval. It is commonly used in industrial applications to store and analyze time-series data from various sources, including PMUs.

## Redpanda
Redpanda is a high-performance streaming platform that is compatible with Apache Kafka. It is designed for real-time data processing and can handle large volumes of data with low latency.

## TimescaleDB
TimescaleDB is a time-series database built on PostgreSQL. It is optimized for storing and querying time-series data, making it a suitable choice for applications that require historical data analysis alongside real-time processing.
