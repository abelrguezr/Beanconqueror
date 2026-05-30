// coffeeSensorTemperatureCompanion.ts
import { PeripheralData } from './ble.types';
import { TemperatureDevice } from './temperatureBluetoothDevice';

export class CoffeeSensorTemperatureCompanion extends TemperatureDevice {
  constructor(data: PeripheralData) {
    super(data);
  }

  // Public bridge — lets CoffeeSensorPressure push readings in
  // without exposing setTemperature on the base class.
  public pushTemperature(celsius: number, rawData: any): void {
    this.setTemperature(celsius, rawData);
  }

  public connect(): void {}
  public disconnect(): void {}
}