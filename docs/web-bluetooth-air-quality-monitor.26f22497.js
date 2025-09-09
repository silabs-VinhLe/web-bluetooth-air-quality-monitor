(function() {
    'use strict';
    const AIR_QUALITY_MONITOR_SERVICE = "8c8299d7-d4c2-4ac4-b2cc-349df7a20af5";
    const CO2_LEVEL_CHARACTERISTIC = "1b621ff2-b789-4b7c-985f-b62a50802bbf";
    const TVOC_VALUE_CHARACTERISTIC = "ec099dd9-7887-4ca6-a169-92a5e9ed7926";
    const AQI_CHARACTERISTIC = "ca19fb61-b04b-409a-8a18-c37560bdf05a";
    const AIR_QUALITY_SETTINGS_SERVICE = "3a79c933-c922-45c7-b5e7-9bdefd126dd9";
    const BUZZER_VOLUME_CHARACTERISTIC = "c5fd8492-9c55-4c18-b761-99b8cf9bca77";
    const MEASUREMENT_PERIOD_CHARACTERISTIC = "98205b49-a9e1-4bfc-a18d-60d36798397f";
    class airQualityMonitoring {
        constructor(){
            this.device = null;
            this.server = null;
            this._characteristics = new Map();
        }
        async connect() {
            let device = await navigator.bluetooth.requestDevice({
                filters: [
                    {
                        name: [
                            'Air Quality'
                        ]
                    },
                    {
                        services: [
                            AIR_QUALITY_MONITOR_SERVICE,
                            AIR_QUALITY_SETTINGS_SERVICE
                        ]
                    }
                ]
            });
            console.log('> Found ' + device.name);
            console.log('Connecting to GATT Server...');
            this.device = device;
            let server = await device.gatt.connect();
            this.server = server;
            let service = await server.getPrimaryService(AIR_QUALITY_MONITOR_SERVICE);
            console.log('> Found service: ' + service.uuid);
            await this._cacheCharacteristics(service, [
                CO2_LEVEL_CHARACTERISTIC,
                TVOC_VALUE_CHARACTERISTIC,
                AQI_CHARACTERISTIC
            ]);
            service = await server.getPrimaryService(AIR_QUALITY_SETTINGS_SERVICE);
            console.log('> Found service: ' + service.uuid);
            await this._cacheCharacteristics(service, [
                BUZZER_VOLUME_CHARACTERISTIC,
                MEASUREMENT_PERIOD_CHARACTERISTIC
            ]);
        }
        /* Air Quality Service */ async writeBuzzerVolume(value) {
            return await this._writeCharacteristicValue(BUZZER_VOLUME_CHARACTERISTIC, value);
        }
        async readBuzzerVolume() {
            let value = await this._readCharacteristicValue(BUZZER_VOLUME_CHARACTERISTIC);
            // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
            value = value.buffer ? value : new DataView(value);
            return value.getUint8(0);
        }
        async writeMeasurementPeriod(value) {
            return await this._writeCharacteristicValue(MEASUREMENT_PERIOD_CHARACTERISTIC, value);
        }
        async readMeasurementPeriod() {
            let value = await this._readCharacteristicValue(MEASUREMENT_PERIOD_CHARACTERISTIC);
            // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
            value = value.buffer ? value : new DataView(value);
            return value.getUint8(0);
        }
        async startNotificationsCO2Level() {
            return await this._startNotifications(CO2_LEVEL_CHARACTERISTIC);
        }
        async startNotificationsTVOC() {
            return await this._startNotifications(TVOC_VALUE_CHARACTERISTIC);
        }
        async startNotificationsAQI() {
            return await this._startNotifications(AQI_CHARACTERISTIC);
        }
        async stopNotificationsCO2Level() {
            return await this._stopNotifications(CO2_LEVEL_CHARACTERISTIC);
        }
        async stopNotificationsTVOC() {
            return await this._stopNotifications(TVOC_VALUE_CHARACTERISTIC);
        }
        async stopNotificationsAQI() {
            return await this._stopNotifications(AQI_CHARACTERISTIC);
        }
        /* Utils */ async _cacheCharacteristics(service, characteristicUuids) {
            for(const index in characteristicUuids){
                let characteristic = await service.getCharacteristic(characteristicUuids[index]);
                console.log('> Found characteristic: ' + characteristic.uuid);
                this._characteristics.set(characteristic.uuid, characteristic);
            }
        }
        async _readCharacteristicValue(characteristicUuid) {
            let characteristic = this._characteristics.get(characteristicUuid);
            let value = await characteristic.readValue();
            // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
            value = value.buffer ? value : new DataView(value);
            return value;
        }
        async _writeCharacteristicValue(characteristicUuid, value) {
            let characteristic = this._characteristics.get(characteristicUuid);
            return await characteristic.writeValue(value);
        }
        async _startNotifications(characteristicUuid) {
            let characteristic = this._characteristics.get(characteristicUuid);
            // Returns characteristic to set up characteristicvaluechanged event
            // handlers in the resolved promise.
            return await characteristic.startNotifications();
        }
        async _stopNotifications(characteristicUuid) {
            let characteristic = this._characteristics.get(characteristicUuid);
            // Returns characteristic to remove characteristicvaluechanged event
            // handlers in the resolved promise.
            return await characteristic.stopNotifications();
        }
    }
    window.airQualityMonitoring = new airQualityMonitoring();
})();

//# sourceMappingURL=web-bluetooth-air-quality-monitor.26f22497.js.map
