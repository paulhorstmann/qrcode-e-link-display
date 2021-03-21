#!/usr/bin/python
# -*- coding:utf-8 -*-
from PIL import Image
import time
import sys
import os

from waveshare_epd import epd5in83bc

picdir = os.path.join(os.path.dirname(
    os.path.dirname(os.path.realpath(__file__))), 'src/assets/img')

try:
    epd = epd5in83bc.EPD()
    # print("init and Clear")
    epd.init()
    # epd.Clear()
    # time.sleep(1)

    HBlackimage = Image.open(os.path.join(picdir, sys.argv[1] + '.site.bmp'))
    HRYimage = Image.open(os.path.join(picdir, 'blank.bmp'))
    epd.display(epd.getbuffer(HBlackimage), epd.getbuffer(HRYimage))

    epd.sleep()

except IOError as e:
    print(e)

except KeyboardInterrupt:
    print("ctrl + c:")
    epd5in83bc.epdconfig.module_exit()
    exit()

print('done')