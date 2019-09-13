
const RPM_TO_RADIANPERSEC = 0.10471975511965977
const RADIANPERSEC_TO_RPM = 9.54929658551
const DEGREE_TO_RADIAN = 0.017453292519943295
const RADIAN_TO_DEGREE = 57.2957795131

const CMD_REG_MAX_SPEED = 0x02
const CMD_REG_ACC = 0x07
const CMD_TEG_DEC = 0x08
const CMD_REG_CURVE_TYPE = 0x05
const CMD_REG_MAX_TORQUE = 0x0E
const CMD_REG_SAVE_ALL_REGISTERS = 0x41

const CMD_ACT_DISABLE = 0x50
const CMD_ACT_ENABLE = 0x51
const CMD_ACT_SPEED = 0x58
const CMD_ACT_RUN_FORWARD = 0x60
const CMD_ACT_RUN_REVERSE = 0x61
const CMD_ACT_RUN_AT_VELOCITY = 0x62
const CMD_ACT_FREE = 0x6C
const CMD_ACT_STOP = 0x6D
const CMD_ACT_MOVE_TO_POSITION = 0x66
const CMD_ACT_MOVE_BY_DISTANCE = 0x68
const CMD_ACT_PRESET_POSITION = 0x5A

const CMD_ACT_PREPARE_PLAYBACK_MOTION = 0x86
const CMD_ACT_START_PLAYBACK_MOTION_FROM_PREP = 0x87
const CMD_ACT_STOP_PLAYBACK_MOTION = 0x88

const CMD_DT_START_TEACH_MOTION = 0xA9
const CMD_DT_STOP_TEACH_MOTION = 0xAC
const CMD_DT_ERASE_MOTION = 0xAD

const CMD_READ_STATUS = 0x9A
const CMD_READ_MOTOR_MEASUREMENT = 0xB4
const CMD_READ_IMU_MEASUREMENT = 0xB5

const CMD_UBIT_GROUPID = 0xCA

const CMD_LED_SET = 0xE0

const CMD_OTHERS_REBOOT = 0xF0

const RECEIVE_TYPE_READ = 0x40
const RECEIVE_TYPE_ERROR = 0xBE
const RECEIVE_TYPE_MOTOR_MEASUREMENT = CMD_READ_MOTOR_MEASUREMENT
const RECEIVE_TYPE_IMU_MEASUREMENT = CMD_READ_IMU_MEASUREMENT

// KeiganMotor 本体のLED状態

var LedState = {
    OFF: 0,
    ON_SOLID: 1,
    ON_FLASH: 2,
    ON_DIM: 3
};



/**
 * 
 * A KeiganMotor
 * @class KeiganMotor
 */
class KeiganMotorI2C {

    constructor(address) {
        this.address = address;

    }

    /*
    onReceivedMotorMeasNotify(callback) {

        let cccd = this.keiganMotorMotorMeasChar.getDescriptor("2902");
        let result = await cccd.writeWait([0x01, 0x00]); // register cccd for remote peripheral 
        console.log(await cccd.readWait()); // check cccd 

        if (result) {
            console.log(this.name, ": [MotorMeasurement] Enable Notification Success");
            var self = this;
            this.keiganMotorMotorMeasChar.registerNotify(

                function (data) {
                    console.log("notify");
                    let u8 = new Uint8Array(data);//info::一旦コピーする必要がある
                    let dv = new DataView(u8.buffer);
                    //単位を扱い易いように変換
                    let pos = dv.getFloat32(0, false);
                    let vel = dv.getFloat32(4, false);
                    let trq = dv.getFloat32(8, false);
                    callback(self, pos, vel, trq);
                    //console.log(this.keiganMotorMotorMeasChar.properties);
                });


        } else {
            console.log("[MotorMeasurement] Enable Notification Failure");
            //callback();
        }


    }
    */

    /**
     * buffer の内容を I2C で送信します
     *
     * @param {*} buffer
     * @memberof KeiganMotorI2C
     */
    write(buffer) {
        console.log(buffer);
        obniz.i2c0.write(this.address, buffer);
    }


    /**
     * buffer の内容を I2C で送信し、受信します
     *
     * @param {*} buffer 送信バッファ
     * @param {*} recv_len 受信バッファの長さ
     * @returns
     * @memberof KeiganMotorI2C
     */
    async read(buffer, recv_len) {
        obniz.i2c0.write(this.address, buffer);
        return await obniz.i2c0.readWait(this.address, recv_len);
    }


    /**
     * Enable Motor Action（モーターの動作を許可する）
     * 
     * @memberof KeiganMotor
     */
    enable() {
        var buf = [CMD_ACT_ENABLE, 0x00, 0x00, 0x00, 0x00];
        this.write(buf);
    }

    /**
     * Disable Motor Action（モーターの動作を不許可とする）
     * 
     * @memberof KeiganMotor
     */
    disable() {
        var buf = [CMD_ACT_DISABLE, 0x00, 0x00, 0x00, 0x00];
        this.write(buf);       
    }

    /**
     * Set speed [rad/s]（モーターの回転スピードを設定する）
     * 
     * @param {*} val
     * @memberof KeiganMotor
     */
    speed(val) {
        var ab = new ArrayBuffer(9);
        new DataView(ab).setUint8(0, CMD_ACT_SPEED);
        new DataView(ab).setFloat32(3, Math.abs(parseFloat(val)));
        var b = new Uint8Array(ab);
        var buf = Array.from(b);
        this.write(buf);
    }

   
    /**
     * Set speed [rpm]（モーターの回転スピードを設定する）
     * 
     * @param {*} val
     * @memberof KeiganMotor
     */
    speedRpm(val) {
        this.speed(RPM_TO_RADIANPERSEC * val);
    }

    /** 
     * Run at velocity [rad/s]（指定の速度で回転させる）
     * 
     * @param  {number} val velocity 速度 [rad/s]
     * @memberof KeiganMotor
     */
    runAtVelocity(val) {
        var ab = new ArrayBuffer(9);
        new DataView(ab).setUint8(0, CMD_ACT_RUN_AT_VELOCITY);
        new DataView(ab).setFloat32(3, Math.abs(parseFloat(val)));
        var b = new Uint8Array(ab);
        var buf = Array.from(b);
        this.write(buf);
    }

    /** 
     * Run at velocity [rpm]（指定の速度で回転させる）
     * 
     * @param  {number} val velocity 速度 [rpm]
     * @memberof KeiganMotor
     */
    runAtRpm(val) {
        this.runAtVelocity(RPM_TO_RADIANPERSEC * val);
    }

    /**
     * Run Forward (Counter Clockwise) （正回転（反時計回りの方向）させる）
     *
     * @memberof KeiganMotor
     */
    runForward() {
        var buf = [CMD_ACT_RUN_FORWARD, 0x00, 0x00, 0x00, 0x00];
        this.write(buf);
    }

    /** 
     * Run Reverse (Clockwise) （逆回転（時計回りの方向）させる）
     * 
     * @memberof KeiganMotor
     */
    runReverse() {
        var buf = [CMD_ACT_RUN_REVERSE, 0x00, 0x00, 0x00, 0x00];
        this.write(buf);
    }

    /** 
     * Stop (control by speed = 0)) （停止させる）
     * 
     * @memberof KeiganMotor
     */
    stop() {
        var buf = [CMD_ACT_STOP, 0x00, 0x00, 0x00, 0x00];
        this.write(buf);
    }

    /** 
     * Make Motor energize and free（モータ－を比励磁とし、フリー状態とする）
     * 
     * @memberof KeiganMotor
     */
    free() {
        var buf = [CMD_ACT_FREE, 0x00, 0x00, 0x00, 0x00];
        this.write(buf);
    }

    /** 
     * Move to absolute position [rad]（絶対位置に移動する）
     * 
     * @param  {number} val absolute position 絶対位置 [rad]
     * @memberof KeiganMotor
     */
    moveToPosition(val) {
        var ab = new ArrayBuffer(9);
        new DataView(ab).setUint8(0, CMD_ACT_MOVE_TO_POSITION);
        new DataView(ab).setFloat32(3, Math.abs(parseFloat(val)));
        var b = new Uint8Array(ab);
        var buf = Array.from(b);
        this.write(buf);
    }

    /**
     * Move to absolute position [degree]（絶対位置に移動する）
     * 
     * @param  {number} val absolute position 絶対位置 [degree]
     * @memberof KeiganMotor
     */ 
    moveToDegree(val) {
        this.moveToPosition(val * DEGREE_TO_RADIAN);
    }

    /**
     * Move by distance [rad]（相対位置移動する）
     * 
     * @param  {number} val distance (relative position) 相対位置 [rad]
     * @memberof KeiganMotor
     */
    moveByDistance(val) {
        var ab = new ArrayBuffer(9);
        new DataView(ab).setUint8(0, CMD_ACT_MOVE_BY_DISTANCE);
        new DataView(ab).setFloat32(3, Math.abs(parseFloat(val)));
        var b = new Uint8Array(ab);
        var buf = Array.from(b);
        this.write(buf);
    }

    /**
     * Move by distance [degree]（相対位置移動する）
     * 
     * @param  {number} val distance (relative position) 相対位置 [degree]
     * @memberof KeiganMotor
     */    
    moveByDegree(val) {
        this.moveByDistance(val * DEGREE_TO_RADIAN);
    }


    /*
     * KeiganMotor LED Characteristics
     */

    /**
     * Set LED state and color LEDの状態とカラーをセットする
     *
     * @param {number} state State of LED (0: OFF, 1: ON_SOLID, 2: ON_FLASH, 3: ON_DIM)
     * @param {number} red brightness of red LED (from 0 to 255)
     * @param {number} green brightness of red LED (from 0 to 255)
     * @param {number} blue brightness of red LED (from 0 to 255)
     * @memberof KeiganMotor
     */
    led(state, red, green, blue) {
        var valid = ((red >= 0 && red <= 255) && (green >= 0 && green <= 255) && (blue >= 0 && blue <= 255));
        console.log(valid);
        if (valid) {
            var buf = [CMD_LED_SET, 0, 0, state, red, green, blue, 0, 0];
            this.write(buf);
        }
    }


    /**
     * Save all registers to flash フラッシュに全レジスタを保存する
     *
     * @memberof KeiganMotor
     */
    saveAllRegisters() {
        var buf = [CMD_REG_SAVE_ALL_REGISTERS, 0x00, 0x00, 0x00, 0x00];
        this.write(buf);
    }




}






