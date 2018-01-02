/**
 *  DSC Alarm Partition
 *
 *  Copyright 2016 SmartThings
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License. You may obtain a copy of the License at:
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed
 *  on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License
 *  for the specific language governing permissions and limitations under the License.
 *
*/
import groovy.json.JsonSlurper;

preferences {
    section() {
        input("user_code", "password", title: "Alarm Code", description: "The user code for the panel", required: true)
    }
}

metadata {
    definition (name: "DSC Alarm Partition", namespace: "TenStartups", author: "Marc Lennox") {
        capability "Refresh"
        capability "Alarm"              // PANIC
        capability "smokeDetector"      // FIRE

        command "disarm"
        command "armStay"
        command "armAway"
        command "panic"

        attribute "partitionState", "enum", ["disarmed", "disarming", "armed_stay", "armed_away", "arming"]
    }

    simulator {
        // TODO: define status and reply messages here
    }

    tiles(scale: 2) {
        multiAttributeTile(name: "status", type: "generic", width: 6, height: 4) {
            tileAttribute("device.partitionState", key: "PRIMARY_CONTROL") {
                attributeState "disarmed", label: 'Disarmed', icon: "st.security.alarm.off", backgroundColor: "#79b821", defaultState: true
                attributeState "armed_away", label: 'Armed (Away)', icon: "st.security.alarm.on", backgroundColor: "#ffa81e"
                attributeState "armed_stay", label: 'Armed (Stay)', icon: "st.security.alarm.on", backgroundColor: "#ffa81e"
                attributeState "alarming", label: 'Alarming!', icon: "st.home.home2", backgroundColor: "#ff4000"
                attributeState "fire", label: 'Fire!', icon: "st.contact.contact.closed", backgroundColor: "#ff0000"
            }
        }

        standardTile("disarm", "device.partitionState", inactiveLabel: false, width: 2, height: 2) {
            state "default", label: "DISARM", action: "disarm", icon: "st.security.alarm.off", backgroundColor: "#ffffff", nextState: "disarming"
            state "disarmed", label: "DISARMED", action: "", icon: "st.security.alarm.off", backgroundColor: "#79b821", nextState: "disarming"
            state "disarming", label: "DISARMING", action: "disarm", icon: "st.security.alarm.off", backgroundColor: "#2179b8"
        }

        standardTile("armStay", "device.partitionState", inactiveLabel: false, width: 2, height: 2) {
            state "default", label: "ARM (STAY)", action: "armStay", icon: "st.security.alarm.on", backgroundColor: "#ffffff", nextState: "arming_stay"
            state "armed_stay", label: "ARMED (STAY)", action: "", icon: "st.security.alarm.on", backgroundColor: "#79b821", nextState: "arming_stay"
            state "arming_stay", label: "ARMING (STAY)", action: "armStay", icon: "st.security.alarm.on", backgroundColor: "#2179b8"
        }

        standardTile("armAway", "device.partitionState", inactiveLabel: false, width: 2, height: 2) {
            state "default", label: "ARM (AWAY)", action: "armAway", icon: "st.security.alarm.on", backgroundColor: "#ffffff", nextState: "arming_away"
            state "armed_away", label: "ARMED (AWAY)", action: "", icon: "st.security.alarm.on", backgroundColor: "#79b821", nextState: "arming_away"
            state "arming_away", label: "ARMING (AWAY)", action: "armAway", icon: "st.security.alarm.on", backgroundColor: "#2179b8"
        }

        standardTile("refresh", "device.refresh", inactiveLabel: false, decoration: "flat", width: 2, height: 2) {
            state "default", action:"refresh.refresh", icon:"st.secondary.refresh"
        }

        main(["status"])
        details(["status", "disarm", "armStay", "armAway", "refresh"])
    }
}

def installed() {
    log.debug "Installed with settings: ${settings}"
}

def updated() {
    log.debug "Updated with settings: ${settings}"
}

def disarm() {
    log.debug("Disarming alarm partition")
    sendCommand("disarm", true)
}

def armStay() {
    log.debug("Arming alarm partition in STAY mode")
    sendCommand("arm_stay")
}

def armAway() {
    log.debug("Arming alarm partition in AWAY mode")
    sendCommand("arm_away")
}

def refresh()
{
    log.debug "Refreshing alarm partition status..."
    sendCommand("status")
}

def sendCommand(String commandPath, boolean sendCode = false) {
	def path = "/api/partition/${getDataValue("externalId")}/${commandPath}"
    if (sendCode) {
    	path = "${path}/${settings.user_code}"
    }
    new physicalgraph.device.HubAction(
        [
            method: "POST",
            path: path,
            headers: [ HOST: "${getDataValue("ipAddress")}:${getDataValue("ipPort")}" ]
        ],
        null,
        [ callback: sendCommandResponseHandler ]
    )
}

def sendCommandResponseHandler(physicalgraph.device.HubResponse hubResponse) {
    processStatusUpdate(hubResponse.json?.result)
}

def processStatusUpdate(data) {
    if (data != null && data.status != null) {
        log.debug "Partition status is ${data.status.toUpperCase()}"
        sendEvent(name: "partitionState", value: data.status)
    }
}
