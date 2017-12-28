/**
*  DSC Alarm Motion Zone
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
import groovy.json.JsonSlurper

metadata {
    definition (name: "DSC Alarm Motion Zone", author: "marclennox", namespace: "TenStartups") {
    		capability "Motion Sensor"
        capability "Refresh"
    }

    // simulator metadata
    simulator {
    }

    // UI tile definitions
    tiles(scale:2) {
        standardTile("sensor", "device.motion", width: 6, height:4, canChangeIcon: true) {
            state "inactive", label: 'No Motion', icon: "st.motion.motion.inactive", backgroundColor: "#ffffff"
            state "active", label: 'Motion', icon: "st.motion.motion.active", backgroundColor: "#79b821"
        }
        standardTile("refresh", "device.refresh", inactiveLabel: false, decoration: "flat", width: 2, height: 2) {
            state "default", label: "", action: "refresh.refresh", icon: "st.secondary.refresh"
        }
        main(["sensor"])
        details(["sensor", "refresh"])
    }
}

def installed() {
    log.debug "Installed with settings: ${settings}"
}

def updated() {
    log.debug "Updated with settings: ${settings}"
}

def refresh()
{
    log.debug "Refreshing alarm motion zone status..."
    sendCommand("status")
}

def sendCommand(String commandPath) {
    new physicalgraph.device.HubAction(
        [
            method: "POST",
            path: "/api/motion_zone/${getDataValue("externalId")}/${commandPath}",
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
log.debug(data)
    if (data.status != null) {
        log.debug "Motion zone status is ${data.status.toUpperCase()}"
        sendEvent(name: "switch", value: data.status)
    }
}