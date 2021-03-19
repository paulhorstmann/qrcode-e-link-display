#!/usr/bin/python
# -*- coding:utf-8 -*-
from PIL import Image
import time

from waveshare_epd import epd5in83bc

try:
    epd = epd5in83bc.EPD()
    print("init and Clear")
    epd.init()
    epd.Clear()
    time.sleep(1)

    epd.sleep()

except IOError as e:
    print(e)

except KeyboardInterrupt:
    print("ctrl + c:")
    epd5in83bc.epdconfig.module_exit()
    exit()
