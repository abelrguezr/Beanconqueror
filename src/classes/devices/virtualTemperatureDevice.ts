import { PeripheralData } from './ble.types';
import { TemperatureDevice } from './temperatureBluetoothDevice';

// Minimal virtual temperature device used to expose a persistent temperature
// source that can be fed by pressure-device combined notifications.
export class VirtualTemperatureDevice extends TemperatureDevice {
  constructor(data: PeripheralData) {
    super(data);
  }

  // No-op connect: virtual device is always 'connected'
  public connect(): void {
    // intentionally empty
  }

  public disconnect(): void {
    // intentionally empty
  }
}
