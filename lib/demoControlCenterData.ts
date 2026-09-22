export interface DemoAlert {
  id: string;
  severity: "WARNING" | "ATTENTION" | "INFO";
  title: string;
  location: string;
  timestamp: string;
  description: string;
}

export interface DemoSensorReading {
  channel: string;
  name: string;
  value: string;
  unit: string;
  status: "NORMAL" | "WARNING" | "ATTENTION";
  location: string;
}

export interface DemoControlCenterData {
  systemStatus: {
    healthPercentage: number;
    healthStatus: string;
    conveyorId: string;
    activeAlertsCount: number;
    mode: string;
    plantName: string;
  };
  alerts: DemoAlert[];
  sensors: DemoSensorReading[];
  trendPoints: { x: number; y: number; isAnomaly?: boolean }[];
  localLcdDisplay: {
    line1: string;
    line2: string;
    line3: string;
  };
  intelligenceNotes: {
    category: string;
    note: string;
    date: string;
  }[];
}

export const demoControlCenterData: DemoControlCenterData = {
  systemStatus: {
    healthPercentage: 87,
    healthStatus: "HEALTHY // ATTENTION RECOMMENDED",
    conveyorId: "BC-01",
    activeAlertsCount: 3,
    mode: "DEMO MODE",
    plantName: "PLANT 01 / IRON ORE OPERATIONS",
  },
  alerts: [
    {
      id: "ALT-01",
      severity: "WARNING",
      title: "BELT MISALIGNMENT TREND",
      location: "BC-01 / ZONE B (MIDSPAN)",
      timestamp: "SIMULATED",
      description: "Lateral belt drift exceeding tracking threshold. Inspection recommended.",
    },
    {
      id: "ALT-02",
      severity: "ATTENTION",
      title: "ABNORMAL TEMPERATURE TREND",
      location: "BC-01 / ZONE A (TRANSFER POINT)",
      timestamp: "SIMULATED",
      description: "Thermal rise observed around bearing housing T-03.",
    },
    {
      id: "ALT-03",
      severity: "INFO",
      title: "VIBRATION VARIATION",
      location: "BC-01 / ZONE A (DRIVE ASSEMBLY)",
      timestamp: "SIMULATED",
      description: "Minor RMS acceleration variance within acceptable operating band.",
    },
  ],
  sensors: [
    {
      channel: "CH-01",
      name: "BEARING TEMPERATURE",
      value: "48.2",
      unit: "°C",
      status: "ATTENTION",
      location: "ZONE A / T-03",
    },
    {
      channel: "CH-02",
      name: "DRIVE VIBRATION",
      value: "2.4",
      unit: "mm/s",
      status: "NORMAL",
      location: "ZONE A / V-02",
    },
    {
      channel: "CH-03",
      name: "MOTOR CURRENT",
      value: "142.5",
      unit: "A",
      status: "NORMAL",
      location: "ZONE A / M-01",
    },
    {
      channel: "CH-04",
      name: "BELT SPEED",
      value: "3.45",
      unit: "m/s",
      status: "NORMAL",
      location: "ZONE B / S-01",
    },
    {
      channel: "CH-05",
      name: "LATERAL ALIGNMENT",
      value: "+14.2",
      unit: "mm",
      status: "WARNING",
      location: "ZONE B / A-01",
    },
    {
      channel: "CH-06",
      name: "BELT TENSION / LOAD",
      value: "84.1",
      unit: "kN",
      status: "NORMAL",
      location: "ZONE C / L-01",
    },
  ],
  trendPoints: [
    { x: 0, y: 30 },
    { x: 50, y: 32 },
    { x: 100, y: 28 },
    { x: 150, y: 35 },
    { x: 200, y: 31 },
    { x: 250, y: 40 },
    { x: 300, y: 48, isAnomaly: true },
    { x: 350, y: 65, isAnomaly: true },
    { x: 400, y: 78, isAnomaly: true },
    { x: 450, y: 70, isAnomaly: true },
    { x: 500, y: 55 },
  ],
  localLcdDisplay: {
    line1: "BC-01 | STATUS: NORMAL",
    line2: "SPD: 3.45m/s ALIGN: +14mm",
    line3: "ALERTS: 01 WARNING",
  },
  intelligenceNotes: [
    {
      category: "EARLY ATTENTION",
      note: "Vibration & lateral drift trend at Zone B requires routine tracking inspection.",
      date: "SIMULATED ANALYSIS",
    },
    {
      category: "MAINTENANCE SCHEDULE",
      note: "Routine bearing lubrication check scheduled for Transfer Point T-03.",
      date: "SCHEDULED",
    },
  ],
};
