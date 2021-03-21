#!/usr/bin/python
# -*- coding:utf-8 -*-

import textwrap
import qrcode
from PIL import Image, ImageFont, ImageDraw

import json
import os

currentdir = os.path.dirname(os.path.realpath(__file__))

with open(currentdir + '/assets/temp/temp.site.json') as f:
    data = json.load(f)


genre = data["type"]
titel = data["header"]
beschreibung = data["description"]
urlString = data["qrcode"]
 
genreList = {
    'herder-news': 'Herder News',
    'cloud-link': 'Cloud Link',
    'link': 'Hyperlink',
    'wlan': 'Wlan Zugang',
    'contact': 'Kontakt'
}

genre = genreList[genre]

imgWidth = 600
imgHeight = 448

# Roboto Schriftart
pathToRoboto = currentdir + "/../public/assets/font/Roboto-Regular.ttf"
genreFont = ImageFont.truetype(currentdir + "/../public/assets/font/Roboto-Medium.ttf", 30)
titelFont = ImageFont.truetype(pathToRoboto, 27)
beschreibungFont = ImageFont.truetype(pathToRoboto, 17)

img = Image.new('RGB', (imgWidth, imgHeight), color='white')

d = ImageDraw.Draw(img)

# Zeichne Rahmen t-r-b-l
d.line((20, 20, imgWidth - 20, 20), fill=128, width=2)
d.line((imgWidth - 20, 20, imgWidth - 20, imgHeight - 20), fill=128, width=2)
d.line((20, imgHeight - 20, imgWidth - 20, imgHeight - 20), fill=128, width=2)
d.line((20, 20, 20, imgHeight - 20), fill=128, width=2)

# Divider
d.line((20, 80, imgWidth - 20, 80), fill=128, width=2)

# Zeichne Schrift
d.text((35, 35), genre, font=genreFont, fill=(0, 0, 0))
d.text((35, 100), titel, font=titelFont, fill=(0, 0, 0))

lines = textwrap.wrap(beschreibung, width=35)
y_text = 145
i = 0
for line in lines:
    i += 1
    if i < 11:
        d.text((35, y_text), line,
               font=beschreibungFont, fill="black")
        y_text += 25
    elif i == 11:
        d.text((35, y_text), line + ' ...',
               font=beschreibungFont, fill="black")
        y_text += 25

# Zeichne Icon
img.paste(Image.open(currentdir + '/assets/img/icon/' +
                     data["icon"].replace(' ', '') + '.bmp'), (525, 30))

# Erstelle qrCode
qr = qrcode.QRCode(
    version=1,
    box_size=20,
    border=0
)

qr.add_data(urlString)
qr.make(fit=True)
qrImage = qr.make_image(fill='black', back_color='white')
qrImage = qrImage.resize((175, 175), Image.NEAREST)

img.paste(qrImage, (380, 190))

img.save(currentdir + '/assets/img/' + str(data["site"]) + '.site.bmp')

print('Done')