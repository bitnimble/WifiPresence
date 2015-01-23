# WifiPresence
WifiPresence is a program intended to determine the presence of registered users based on sniffed packets.
It sniffs nearby packets for MAC addresses, and by looking up a list of registered users it can determine whether somebody is nearby or not. 
This program requires the users in question to have wifi enabled on their devices and generating traffic - passive traffic from a smartphone (even if the phone is asleep) should be enough to be detected. However, for debugging purposes it may be safer to load a video or a few webpages just to ensure that the packets are definitely being sniffed.

The program is split into multiple parts in order to maintain modularity:

####Sniffer  
A small bash script that executes kismet_server, collects information for a minute, then publishes the results to a specific MQTT topic (default: wifipresencedb).

####DB  
A Node.js script that listens on the sniffer's MQTT topic (wifipresencedb) and puts the MAC addresses it reads into a database along with the current time. After doing so, it looks through its list of registered users and checks whether the MAC address it received was registered - if so, it republishes the MAC address along with the name and the time to another topic (default: wifipresencenamed).

####Site  
A Node.js running an express server/website. Provides a nice way to look at the real-time updates that the DB script publishes, displaying a list of registered users and the last date & time they were "seen" (defaulted to within the last 2 days).

####Register  
A Node.js script that connects to DB's database and adds, updates or removes users. Syntax is as follows:  

    Adding or updating a user:  
    a [MAC ADDRESS] [INSERT NAME HERE]
    
    Removing a user:  
    r [MAC ADDRESS]
    
    
#Requirements

####Sniffer  
The sniffer requires Kismet and mosquitto_pub to be installed and working. 

####DB  
DB requires the Node.js modules mqtt and mongodb to be installed. It also requires a MongoDB instance to be running - the address is configurable and defaulted to localhost.

####Site
The website server requires the Node.js modules express, body-parser, sockets.io, mqtt, fs, moment and mongodb to be installed. It also requires the same MongoDB instance to be running (again defaulted to localhost). 


####Register
The registration program requires the Node.js module mongodb to be installed and, of course, the MongoDB instance to be running. Make sure it is the same instance DB is using!
