# lora_gateway
based on raspberry pi and waveshare SX126x lora hat using node.js.

the waveshare lora module is controlled via uart interface (9600 8N1).
in transmission mode it wireless transmits the bytes received via uart.
in configuration mode it listens to commands from 'registers configuration'.

## Hardware

### Jumpersettings

Mode = B (control lora module through raspberry pi)

M0/M1 Jumper removed

| M0   | M1   | Mode              |
|------|------|-------------------|
| short| short| transmission mode |
| short| open | configuration mode|
| open | short| WOR mode          |
| open | open | deep sleep mode   |

## Software

node.js version v18.20

## Setup

make sure Serial on raspberry pi is enabled via raspi-config
