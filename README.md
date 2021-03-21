# Projektkurs
Dieses Projekt ist im Rahmen des Projektkures am Herder Gymnasium Minden entstanden

# Materialien zur Rekonstruktion
- raspberry pi b (+)
- 5.83inch e-Paper -> [Webseite](https://www.waveshare.com/wiki/5.83inch_e-Paper_HAT_(B))

# Gruppenmitglieder
- Dantar
- Samual
- Paul Horstmann

# Projekt aufsetzen

## Installationen

1. Installiere NodeJS^14.16.0, Python^2.7 und Git

2. Installiere Yarn mit npm (npm wird mit NodeJs installiert)
```
    sudo npm install --global yarn
```
3. Installiere qrcode und PIL mit PIP
```
    python -m pip install qrcode PIL
```
4. Clone das Repository mit Git
```
    git clone https://github.com/paulhorstmann/qrcode-e-link-display
```
5. Installiere die Javascript Pakete mit Yarn
```
    yarn install
```
6. Installiere die waveshare_epd Lib
```
    cd pythonsetup
    sudo python setup.py install
```
7. Reboot!
 ```
    sudo shutdown -r
```   

## Pi Freigaben
1. Port 80 freigebn
```
    sudo ufw allow 80
```
2. SPI-Pinns freigeben

[https://www.raspberrypi.org/documentation/hardware/raspberrypi/spi/README.md](https://www.raspberrypi.org/documentation/hardware/raspberrypi/spi/README.md)

```
    sudo raspi-config
```

# Viewer starten

```
    sudo yarn start
```