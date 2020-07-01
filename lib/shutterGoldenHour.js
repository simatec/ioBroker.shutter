'use strict';

const schedule = require('node-schedule');
const shutterState = require('./shutterState.js');         // shutterState

function shutterGoldenHour(adapter, goldenHourEnd, goldenHour) {

    const driveDelayUpAstro = adapter.config.driveDelayUpAstro * 1000;

    if (goldenHourEnd) {

        let upTime = goldenHourEnd.split(':');

        schedule.cancelJob('shutterUpGoldenHourEnd');

        const upGoldenHour = schedule.scheduleJob('shutterUpGoldenHourEnd', upTime[1] + ' ' + upTime[0] + ' * * *', function () {
            // Full Result
            const resultFull = adapter.config.events;

            if (resultFull) {
                // Filter Area Living
                const /**
                     * @param {{ typeUp: string; }} d
                     */
                    resLiving = resultFull.filter(d => d.typeUp == 'goldenhour End');
                // Filter enabled
                let /**
                     * @param {{ enabled: boolean; }} d
                     */
                    resEnabled = resLiving.filter(d => d.enabled === true);

                let result = resEnabled;

                for (const i in result) {
                    let nameDevice = result[i].shutterName.replace(/[.;, ]/g, '_');
                    /**
                     * @param {any} err
                     * @param {boolean} state
                     */
                    adapter.getState('shutters.autoUp.' + nameDevice, (err, state) => {
                        if (state && state === true || state && state.val === true) {
                            setTimeout(function () {
                                let shutterHeight = 0;
                                if (result[i].currentAction == 'sunProtect' || result[i].currentAction == 'OpenInSunProtect') {
                                    shutterHeight = parseFloat(result[i].heightDownSun);
                                    result[i].currentAction = 'sunProtect';
                                    adapter.setState('shutters.autoState.' + nameDevice, { val: result[i].currentAction, ack: true });
                                } else {
                                    shutterHeight = parseFloat(result[i].heightUp);
                                    result[i].currentAction = 'up';
                                    adapter.setState('shutters.autoState.' + nameDevice, { val: result[i].currentAction, ack: true });
                                }
                                let currentValue = '';
                                /**
                                 * @param {any} err
                                 * @param {{ val: string; }} state
                                 */
                                adapter.getForeignState(result[i].triggerID, (err, state) => {
                                    let mustValue = ('' + result[i].triggerState);
                                    if (typeof state != undefined && state != null) {
                                        currentValue = ('' + state.val);
                                    }
                                    if (currentValue === mustValue || (currentValue != mustValue && result[i].autoDrive != 'onlyDown' && result[i].autoDrive != 'off')) {
                                        /**
                                         * @param {any} err
                                         * @param {{ val: number; }} state
                                         */
                                        adapter.getForeignState(result[i].name, (err, state) => {
                                            if (typeof state != undefined && state != null && state.val != shutterHeight) {
                                                adapter.log.info('#5 Set ID: ' + result[i].shutterName + ' value: ' + shutterHeight + '%');
                                                adapter.setForeignState(result[i].name, shutterHeight, false);
                                                result[i].currentHeight = shutterHeight;
                                                adapter.setState('shutters.autoLevel.' + nameDevice, { val: result[i].currentHeight, ack: true });
                                                adapter.log.debug('save current height: ' + result[i].currentHeight + '%' + ' from ' + result[i].shutterName);
                                                shutterState(result[i].name, adapter);
                                            }
                                        });
                                    } else if (result[i].triggerID == '') {
                                        /**
                                         * @param {any} err
                                         * @param {{ val: number; }} state
                                         */
                                        adapter.getForeignState(result[i].name, (err, state) => {
                                            if (typeof state != undefined && state != null && state.val != shutterHeight) {
                                                adapter.log.info('#6 Set ID: ' + result[i].shutterName + ' value: ' + shutterHeight + '%');
                                                adapter.setForeignState(result[i].name, shutterHeight, false);
                                                result[i].currentHeight = shutterHeight;
                                                adapter.setState('shutters.autoLevel.' + nameDevice, { val: result[i].currentHeight, ack: true });
                                                adapter.log.debug('save current height: ' + result[i].currentHeight + '%' + ' from ' + result[i].shutterName);
                                                shutterState(result[i].name, adapter);
                                            }
                                        });
                                    }
                                });
                            }, driveDelayUpAstro * i, i);
                        }
                    });
                }
            }
        });
    }

    if (goldenHour) {

        let upTime = goldenHour.split(':');

        schedule.cancelJob('shutterDownGoldenHour');

        const downGoldenHour = schedule.scheduleJob('shutterDownGoldenHour', upTime[1] + ' ' + upTime[0] + ' * * *', function () {
            // Full Result
            const resultFull = adapter.config.events;

            if (resultFull) {
                // Filter Area Living
                const /**
                     * @param {{ typeDown: string; }} d
                     */
                    resLiving = resultFull.filter(d => d.typeDown == 'goldenhour');
                // Filter enabled
                let /**
                     * @param {{ enabled: boolean; }} d
                     */
                    resEnabled = resLiving.filter(d => d.enabled === true);

                let result = resEnabled;

                for (const i in result) {
                    let nameDevice = result[i].shutterName.replace(/[.;, ]/g, '_');
                    /**
                     * @param {any} err
                     * @param {boolean} state
                     */
                    adapter.getState('shutters.autoDown.' + nameDevice, (err, state) => {
                        if (state && state === true || state && state.val === true) {
                            setTimeout(function () {
                                let currentValue = '';
                                /**
                                 * @param {any} err
                                 * @param {{ val: string; }} state
                                 */
                                adapter.getForeignState(result[i].triggerID, (err, state) => {
                                    let mustValue = ('' + result[i].triggerState);
                                    if (typeof state != undefined && state != null) {
                                        currentValue = ('' + state.val);
                                    }
                                    if (currentValue === mustValue || (currentValue != mustValue && result[i].autoDrive != 'onlyUp' && result[i].autoDrive != 'off')) {
                                        /**
                                         * @param {any} err
                                         * @param {{ val: any; }} state
                                         */
                                        adapter.getForeignState(result[i].name, (err, state) => {
                                            if (typeof state != undefined && state != null && state.val != result[i].heightDown) {
                                                adapter.log.info('#7 Set ID: ' + result[i].shutterName + ' value: ' + result[i].heightDown + '%');
                                                adapter.setForeignState(result[i].name, parseFloat(result[i].heightDown), false);
                                                result[i].currentHeight = result[i].heightDown;
                                                result[i].currentAction = 'down';
                                                adapter.setState('shutters.autoState.' + nameDevice, { val: result[i].currentAction, ack: true });
                                                adapter.log.debug('save current height: ' + result[i].currentHeight + '%' + ' from ' + result[i].shutterName);
                                                shutterState(result[i].name, adapter);
                                            }
                                        });
                                    } else if (result[i].triggerID == '') {
                                        /**
                                         * @param {any} err
                                         * @param {{ val: any; }} state
                                         */
                                        adapter.getForeignState(result[i].name, (err, state) => {
                                            if (typeof state != undefined && state != null && state.val != result[i].heightDown) {
                                                adapter.log.info('#8 Set ID: ' + result[i].shutterName + ' value: ' + result[i].heightDown + '%');
                                                adapter.setForeignState(result[i].name, parseFloat(result[i].heightDown), false);
                                                result[i].currentHeight = result[i].heightDown;
                                                adapter.setState('shutters.autoLevel.' + nameDevice, { val: result[i].currentHeight, ack: true });
                                                result[i].currentAction = 'down';
                                                adapter.setState('shutters.autoState.' + nameDevice, { val: result[i].currentAction, ack: true });
                                                adapter.log.debug('save current height: ' + result[i].currentHeight + '%' + ' from ' + result[i].shutterName);
                                                shutterState(result[i].name, adapter);
                                            }
                                        });
                                    }
                                });
                            }, driveDelayUpAstro * i, i);
                        }
                    });
                }
            }
        });
    }
}
module.exports = shutterGoldenHour;