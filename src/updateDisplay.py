import sys
from PIL import Image

print("Aktuelles Bild " + sys.argv[1])

imgPath = './src/assets/img/' + sys.argv[1] + '.site.bmp'

img = Image.open(imgPath)
# img.show()
