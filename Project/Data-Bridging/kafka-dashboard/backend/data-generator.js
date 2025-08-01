const { Kafka } = require('kafkajs');

// Sample PMU data generator for testing
const kafka = new Kafka({
  clientId: 'pmu-data-generator',
  brokers: ['localhost:9092']
});

const producer = kafka.producer();

// Generate sample PMU data
const generatePMUData = (pmuId) => {
  const now = Date.now() / 1000;
  const baseFreq = 50.0 + (Math.random() - 0.5) * 0.2; // 49.9 to 50.1 Hz
  const baseVoltage = 220 + (Math.random() - 0.5) * 2; // 219 to 221 V
  
  return {
    pmu_id: pmuId,
    time: now,
    stream_id_a: 1,
    stream_id_b: 2,
    stream_id_c: 3,
    stat_a: "ok",
    stat_b: "ok",
    stat_c: "ok",
    va_mag: baseVoltage + (Math.random() - 0.5) * 0.5,
    vb_mag: baseVoltage + (Math.random() - 0.5) * 0.5,
    vc_mag: baseVoltage + (Math.random() - 0.5) * 0.5,
    va_ang: 0 + (Math.random() - 0.5) * 2,
    vb_ang: -120 + (Math.random() - 0.5) * 2,
    vc_ang: 120 + (Math.random() - 0.5) * 2,
    ia_mag: Math.random() * 5,
    ib_mag: Math.random() * 5,
    ic_mag: Math.random() * 5,
    ia_ang: Math.random() * 360 - 180,
    ib_ang: Math.random() * 360 - 180,
    ic_ang: Math.random() * 360 - 180,
    frequency_a: baseFreq + (Math.random() - 0.5) * 0.05,
    frequency_b: baseFreq + (Math.random() - 0.5) * 0.05,
    frequency_c: baseFreq + (Math.random() - 0.5) * 0.05,
    rocof_a: (Math.random() - 0.5) * 0.1,
    rocof_b: (Math.random() - 0.5) * 0.1,
    rocof_c: (Math.random() - 0.5) * 0.1,
    Pa: Math.random() * 1000,
    Pb: Math.random() * 1000,
    Pc: Math.random() * 1000,
    Qa: Math.random() * 500,
    Qb: Math.random() * 500,
    Qc: Math.random() * 500,
    P_total: Math.random() * 3000,
    Q_total: Math.random() * 1500
  };
};

const startDataGeneration = async () => {
  try {
    await producer.connect();
    console.log('Connected to Kafka, starting data generation...');
    
    // Generate data every 100ms (10 Hz)
    setInterval(async () => {
      const gridData = generatePMUData(1);
      const microgridData = generatePMUData(2);
      
      // Add some phase difference for microgrid to simulate sync/unsync conditions
      const phaseDrift = Math.sin(Date.now() / 1000 / 10) * 5; // Slow drift
      microgridData.va_ang += phaseDrift;
      microgridData.vb_ang += phaseDrift;
      microgridData.vc_ang += phaseDrift;
      
      await producer.send({
        topic: 'gridPMU',
        messages: [
          {
            key: 'grid-1',
            value: JSON.stringify(gridData),
          },
        ],
      });
      
      await producer.send({
        topic: 'microgridPMU',
        messages: [
          {
            key: 'microgrid-1',
            value: JSON.stringify(microgridData),
          },
        ],
      });
      
      console.log('Sent data - Grid:', gridData.pmu_id, 'Microgrid:', microgridData.pmu_id);
    }, 100);
    
  } catch (error) {
    console.error('Error starting data generation:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down data generator...');
  await producer.disconnect();
  process.exit(0);
});

startDataGeneration();
