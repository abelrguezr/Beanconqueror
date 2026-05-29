import { PeripheralData } from './ble.types';
import { Logger } from './common/logger';
import { TemperatureDevice } from './temperatureBluetoothDevice';

declare var ble: any;

export class VirtualTemperatureDevice extends TemperatureDevice {
  public static DEVICE_NAME = 'Virtual Temp';
  private logger: Logger;

  constructor(data: PeripheralData) {
    super(data);
    this.logger = new Logger('VirtualTemperatureDevice');
    // Report 0°C by default
    this.setVirtualTemperature(0.0);
  }

  // Public method to update the virtual temperature value
  public setVirtualTemperature(tempC: number, rawBuffer?: ArrayBuffer) {
    const safeTemp = Number.isFinite(tempC) ? tempC : 0.0;
    this.logger.log(
      'VirtualTemperatureDevice - set temperature: ' + safeTemp + ' °C',
    );
    this.setTemperature(safeTemp, rawBuffer || new ArrayBuffer(0));
  }

  // No-op attach/detach since this device is virtual
  public connect() {
    // nothing to attach
  }

  public disconnect() {
    // nothing to detach
  }
}
