/**
*  DSC Alarm Contact Zone
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
    definition (name: "DSC Alarm Contact Zone", author: "marclennox", namespace: "TenStartups") {
        capability "Contact Sensor"
        capability "Refresh"
    }

    // simulator metadata
    simulator {
    }

    // UI tile definitions
    tiles(scale:2) {
        standardTile("sensor", "device.contact", width: 2, height: 2, canChangeIcon: true) {
            state "closed", label: '${name}', icon: "st.contact.contact.closed", backgroundColor: "#79b821"
            state "open", label: '${name}', icon: "st.contact.contact.open", backgroundColor: "#ffffff"
        }
        standardTile("refresh", "device.refresh", inactiveLabel: false, decoration: "flat") {
            state "default", label:'Refresh', action:"device.refresh", icon: "st.secondary.refresh-icon"
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
    log.debug "Refreshing alarm contact zone status..."
    sendCommand("status")
}

def sendCommand(String commandPath) {
    new physicalgraph.device.HubAction(
        [
            method: "POST",
            path: "/api/contact_zone/${getDataValue("externalId")}/${commandPath}",
            headers: [ HOST: "${getDataValue("ipAddress")}:${getDataValue("ipPort")}" ]
        ],
        null,
        [ callback: sendCommandResponseHandler ]
    )
}

def sendCommandResponseHandler(physicalgraph.device.HubResponse hubResponse) {
    log.debug("Received command response")
    processStatusUpdate(hubResponse.json?.result)
}

def processStatusUpdate(data) {
    if (data.status != null) {
        log.debug "Contact zone status is ${data.status.toUpperCase()}"
        sendEvent(name: "switch", value: data.status)
    }
}
