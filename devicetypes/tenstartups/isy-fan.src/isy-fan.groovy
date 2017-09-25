/**
 *  ISY Fan
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
	definition (name: "ISY Fan", author: "marclennox", namespace: "TenStartups") {
  		capability "Actuator"
        capability "Configuration"
        capability "Refresh"
        capability "Switch"
        capability "Sensor" 
        capability "Polling"
        capability "Health Check"
   
        command "fanOff"
        command "fanLow"
        command "fanMedium"
        command "fanHigh"
        
        attribute "fanMode", "string"
    }
    
	tiles(scale: 2) {
    	// FAN SWITCH multiple attributes tile with actions named
		multiAttributeTile(name: "switch", type: "lighting", width: 6, height: 4, canChangeIcon: true) {
        	// All tiles must define a PRIMARY_CONTROL. Controls the background color of tile, and specifies the attribute to show on the Device list views
			tileAttribute ("device.fanMode", key: "PRIMARY_CONTROL") {
                //We can use the nextState option in state (single-attribute tiles) or attributeState (Multi-Attribute Tiles) to show 
                //that the device is transitioning to a next state. This is useful to provide visual feedback that the device state is transitioning.
                //When the attribute’s state does change, the tile will be updated according to the state defined for that attribute.
                //To define a transition state, simply define a state for the transition, and reference that state using the nextState option.
                attributeState "default", label: "CHANGING", action: "refresh.refresh", icon: "st.Lighting.light24", backgroundColor: "#2179b8", nextState: "turningOff" //light blue bckgrd
                attributeState "fanHigh", label: "HIGH", action: "fanOff", icon: "st.Lighting.light24", backgroundColor: "#558216", nextState: "turningOff"		//green3 bckground
                attributeState "fanMedium", label: "MED", action: "fanOff", icon: "st.Lighting.light24", backgroundColor: "#669c1c", nextState: "turningOff"			//green2 bckground
                attributeState "fanLow", label: "LOW", action: "fanOff", icon: "st.Lighting.light24", backgroundColor: "#79b821", nextState: "turningOff"			//green1 bckgrnd
                attributeState "fanOff", label: "OFF", action: "", icon: "st.Lighting.light24", backgroundColor: "#ffffff", nextState: "turningOn"				//gray bckgrnd 
                attributeState "turningOn", action: "fanHigh", label: "TURNINGON", icon: "st.Lighting.light24", backgroundColor: "#2179b8", nextState: "turningOn"			//light blue bckgrd
                attributeState "turningOff", action: "fanOff", label: "TURNINGOFF", icon: "st.Lighting.light24", backgroundColor: "#2179b8", nextState: "turningOff"	//light blue bckgr
            }
        }
           
	    // Low fan speed standard tile with actions 
        standardTile("fanLow", "device.fanMode", inactiveLabel: false, width: 2, height: 2) {
            state "default", label: "LOW", action: "fanLow", icon: "https://raw.githubusercontent.com/dcoffing/SmartThingsPublic/master/devicetypes/dcoffing/hampton-bay-universal-ceiling-fan-light-controller.src/Fan175xfinal.png", backgroundColor: "#ffffff", nextState: "turningLow"
            state "fanLow", label: "LOW", action: "", icon: "https://raw.githubusercontent.com/dcoffing/SmartThingsPublic/master/devicetypes/dcoffing/hampton-bay-universal-ceiling-fan-light-controller.src/Fan175xfinal.png", backgroundColor: "#79b821", nextState: "turningLow"
            state "turningLow", label: "CHANGING", action: "fanLow", icon: "https://raw.githubusercontent.com/dcoffing/SmartThingsPublic/master/devicetypes/dcoffing/hampton-bay-universal-ceiling-fan-light-controller.src/Fan175xfinal.png", backgroundColor: "#2179b8"
        }

    	// Medium fan speed standard tile with actions 		
        standardTile("fanMedium", "device.fanMode", inactiveLabel: false, width: 2, height: 2) {
            state "default", label: "MED", action: "fanMedium", icon: "https://raw.githubusercontent.com/dcoffing/SmartThingsPublic/master/devicetypes/dcoffing/hampton-bay-universal-ceiling-fan-light-controller.src/Fan175xfinal.png", backgroundColor: "#ffffff", nextState: "turningMedium"
            state "fanMedium", label: "MED", action: "", icon: "https://raw.githubusercontent.com/dcoffing/SmartThingsPublic/master/devicetypes/dcoffing/hampton-bay-universal-ceiling-fan-light-controller.src/Fan175xfinal.png", backgroundColor: "#79b821", nextState: "turningMedium"
            state "turningMedium", label: "CHANGING", action: "fanMedium", icon: "https://raw.githubusercontent.com/dcoffing/SmartThingsPublic/master/devicetypes/dcoffing/hampton-bay-universal-ceiling-fan-light-controller.src/Fan175xfinal.png", backgroundColor: "#2179b8"
        }

	    // High fan speed standard tile with actions         
        standardTile("fanHigh", "device.fanMode", inactiveLabel: false, width: 2, height: 2) {
            state "default", label: "HIGH", action: "fanHigh", icon: "https://raw.githubusercontent.com/dcoffing/SmartThingsPublic/master/devicetypes/dcoffing/hampton-bay-universal-ceiling-fan-light-controller.src/Fan175xfinal.png", backgroundColor: "#ffffff", nextState: "turningHigh"
            state "fanHigh", label: "HIGH", action: "", icon: "https://raw.githubusercontent.com/dcoffing/SmartThingsPublic/master/devicetypes/dcoffing/hampton-bay-universal-ceiling-fan-light-controller.src/Fan175xfinal.png", backgroundColor: "#79b821", nextState: "turningHigh"
            state "turningHigh", label: "CHANGING", action: "fanHigh", icon: "https://raw.githubusercontent.com/dcoffing/SmartThingsPublic/master/devicetypes/dcoffing/hampton-bay-universal-ceiling-fan-light-controller.src/Fan175xfinal.png", backgroundColor: "#2179b8"
        } 

	    // On/Off  standard tile with actions 
        standardTile("fanOff", "device.fanMode", inactiveLabel: false, width:2, height:2) {
            state "default", label: "OFF", action: "fanOff", icon: "https://raw.githubusercontent.com/dcoffing/SmartThingsPublic/master/devicetypes/dcoffing/hampton-bay-universal-ceiling-fan-light-controller.src/OnOff175xfinal.png", backgroundColor: "#ffffff", nextState: "turningOff"
            state "fanOff", label: "OFF", action: "", icon: "https://raw.githubusercontent.com/dcoffing/SmartThingsPublic/master/devicetypes/dcoffing/hampton-bay-universal-ceiling-fan-light-controller.src/OnOff175xfinal.png", backgroundColor: "#79b821", nextState: "turningOff"
            state "turningOff", label: "TURNINGOFF", action: "fanOff", icon: "st.Home.home30", backgroundColor: "#2179b8"
        }	

        standardTile("refresh", "device.refresh", inactiveLabel: false, decoration: "flat", width: 2, height: 2) {
            state "default", label: "", action: "refresh.refresh", icon: "st.secondary.refresh"
        }

    	//  the tile named "switch" will appear in the Things view 
        main(["switch"])

    	//  tiles listed "switch", "fanLight", etc will appear in the Device Details screen view (order is left-to-right, top-to-bottom)  
        details(["switch", "fanOff", "fanLow", "fanMedium", "fanHigh", "refresh"])
    }

	// simulator metadata
    simulator {
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
        path: "/api/fan/${getDataValue("externalId")}/${commandPath}",
        headers: [
            HOST: "${getDataValue("ipAddress")}:${getDataValue("ipPort")}"
        ]
    )
}

def fanOff() {
	log.debug("Turning fan OFF")
	sendCommand("off")
}

def fanLow() {
	log.debug("Turning fan to LOW")
	sendCommand("low")
}

def fanMedium() {
	log.debug("Turning fan to MEDIUM")
	sendCommand("medium")
}

def fanHigh() {
	log.debug("Turning fan to HIGH")
	sendCommand("high")
}

def refresh()
{
    log.debug "Refreshing fan status..."
    sendCommand("refresh")
}

def processStatusUpdate(data) {
log.debug(data)
    if (data.status != null) {
	    log.debug "Fan speed is ${data.status.toUpperCase()}"
	    sendEvent(name: "fanMode", value: "fan${data.status.capitalize()}")
    }
}
