from PIL import Image
import pytesseract

im = Image.open("ocrtest2.png")

text = pytesseract.image_to_string(im, lang = 'eng')

print(text)