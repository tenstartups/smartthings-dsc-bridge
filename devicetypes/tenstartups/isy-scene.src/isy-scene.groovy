/**
 *  ISY Scene
 *
 *  Copyright 2016 SmartThings
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License. You may obtain a copy of the License at:
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed
 *  on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License
 *  for the specific language governing permissions and limitations under the License.
 *
 */
import groovy.json.JsonSlurper

metadata {
    definition (name: "ISY Scene", author: "marclennox", namespace: "TenStartups") {
        capability "Switch"
        capability "Switch Level"
        capability "Refresh"
    }

    // simulator metadata
    simulator {
    }

    // UI tile definitions
    tiles(scale:2) {
       multiAttributeTile(name: "switch", type: "lighting", width: 6, height: 4, canChangeIcon: true) {
            tileAttribute ("device.switch", key: "PRIMARY_CONTROL") {
                attributeState "on", label:'${name}', action: "switch.off", icon: "st.Lighting.light11", backgroundColor: "#79b821", nextState: "turningOff"
                attributeState "off", label:'${name}', action: "switch.on", icon: "st.Lighting.light13", backgroundColor: "#ffffff", nextState: "turningOn"
                attributeState "turningOn", label:'${name}', action: "switch.off", icon: "st.Lighting.light11", backgroundColor: "#79b821", nextState: "turningOff"
                attributeState "turningOff", label:'${name}', action: "switch.on", icon: "st.Lighting.light13", backgroundColor: "#ffffff", nextState: "turningOn"
            }

           tileAttribute ("device.level", key: "SLIDER_CONTROL") {
               attributeState "level", action: "switch level.setLevel"
           }

        }

        standardTile("refresh", "device.switch", width: 2, height: 2, inactiveLabel: false, decoration: "flat") {
            state "default", label:'', action: "refresh.refresh", icon: "st.secondary.refresh"
        }

        valueTile("level", "device.level", inactiveLabel: false, decoration: "flat", width: 2, height: 2) {
            state "level", label:'${currentValue} %', unit: "%", backgroundColor: "#ffffff"
        }

        main(["switch"])
        details(["switch", "level", "refresh"])
    }
}

def installed() {
    log.debug "Installed with settings: ${settings}"
}

def updated() {
    log.debug "Updated with settings: ${settings}"
}

def sendCommand(String commandPath) {
    new physicalgraph.device.HubAction(
        method: "POST",
        path: "/api/scene/${getDataValue("externalId")}/${commandPath}",
        headers: [
            HOST: "${getDataValue("ipAddress")}:${getDataValue("ipPort")}"
        ]
    )
}

def on() {
    log.debug "Turning scene ON..."
    sendCommand("on")
}

def off() {
    log.debug "Turning scene OFF..."
    sendCommand("off")
}

def setLevel(level) {
    log.debug "Setting scene level to ${level}%..."
    sendCommand("level/${level}")
}

def refresh()
{
    log.debug "Refreshing scene status..."
    sendCommand("refresh")
}

def processStatusUpdate(data) {
    if (data.status != null) {
	    log.debug "Scene status is ${data.status.toUpperCase()}"
	    sendEvent(name: "switch", value: data.status)
    }
    if (data.level != null) {
	    log.debug "Scene level is ${data.level}%"
	    sendEvent(name: "level", value: data.level, unit: "%")
    }
}
