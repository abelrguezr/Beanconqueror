// coffeeSensorPressure.ts
import { PeripheralData } from './ble.types';
import { Logger } from './common/logger';
import { PressureDevice } from './pressureBluetoothDevice';
import { TemperatureDevice } from './temperatureBluetoothDevice';
import { CoffeeSensorTemperatureCompanion } from './coffeeSensorTemperatureCompanion';

// change the field type from TemperatureDevice to the concrete companion
declare var ble: any;

export class CoffeeSensorPressure extends PressureDevice {
  public static DEVICE_NAME = 'ESPROFILE';
  public static DATA_SERVICE = '777b5132-9f56-4850-a14b-34c8df44901a';
  public static PRESSURE_CHAR = '2A6D';
  public static TEMPERATURE_CHAR = '2A6E';
  public static BOARD_TEMP_CHAR = 'B3A976FF-E863-42F5-B9E9-52967358E6F3';
  public static COMBINED_CHAR = '11282dae-6e9c-4223-b6d7-c67878832826';

  private static ATMOSPHERIC_BAR = 0.98;
  private static MIN_CELSIUS = 0.0;
  private static MAX_CELSIUS = 999.0;

  private logger: Logger;

  // Optional companion temperature device — set by the service after construction
public temperatureCompanion: CoffeeSensorTemperatureCompanion | null = null;

  constructor(data: PeripheralData) {
    super(data);
    this.logger = new Logger('CoffeeSensorPressure');
    this.connect();
  }

  public static test(device: any): boolean {
    return (
      device &&
      device.name &&
      device.name.toLowerCase().includes(CoffeeSensorPressure.DEVICE_NAME.toLowerCase())
    );
  }

  public connect() {
    this.attachNotification();
  }

  public disconnect() {
    this.deattachNotification();
  }

  public async updateZero(): Promise<void> {}
  public enableValueTransmission(): void {}
  public disableValueTransmission(): Promise<void> { return null; }

  private attachNotification() {
    ble.startNotification(
      this.device_id,
      CoffeeSensorPressure.DATA_SERVICE,
      CoffeeSensorPressure.COMBINED_CHAR,
      async (_data: any) => {
        this.parseCombinedUpdate(new DataView(_data));
      },
      (_data: any) => {},
    );
  }

  private parseCombinedUpdate(view: DataView) {
    if (view.byteLength < 18) return;

    // --- Pressure ---
    const pressureBarAbsolute = view.getFloat32(8, true);
    const pressureBar = pressureBarAbsolute - CoffeeSensorPressure.ATMOSPHERIC_BAR;
    const batteryPercent = view.getUint8(16);
    this.batteryLevel = batteryPercent;

    this.logger.log(
      `CoffeeSensorPressure - pressure: ${pressureBar} bar (abs ${pressureBarAbsolute}), battery: ${batteryPercent}%`,
    );
    this.setPressure(pressureBar, view.buffer, new Float32Array([pressureBar]));

    // --- Temperature (forwarded to companion if present) ---
    if (this.temperatureCompanion) {
  const rawTemperature = view.getFloat32(4, true);
  const probeTemperature = Math.min(
    Math.max(rawTemperature, CoffeeSensorPressure.MIN_CELSIUS),
    CoffeeSensorPressure.MAX_CELSIUS,
  );
  this.temperatureCompanion.batteryLevel = batteryPercent;
  this.temperatureCompanion.pushTemperature(probeTemperature, view.buffer);
}
}

  private deattachNotification() {
    ble.stopNotification(
      this.device_id,
      CoffeeSensorPressure.DATA_SERVICE,
      CoffeeSensorPressure.COMBINED_CHAR,
      (e: any) => {},
      (e: any) => {},
    );
  }
}