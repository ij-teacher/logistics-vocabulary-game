from pathlib import Path
import sys
root=Path(__file__).parent
sys.path.insert(0,str(root/'.build-deps'))
import qrcode
import qrcode.image.svg
url='https://ij-teacher.github.io/logistics-vocabulary-game/'
(root/'assets').mkdir(exist_ok=True)
qr=qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M,box_size=10,border=4)
qr.add_data(url);qr.make(fit=True)
qr.make_image(image_factory=qrcode.image.svg.SvgPathFillImage).save(root/'assets/game-qr.svg')
qr.make_image(fill_color='black',back_color='white').save(root/'assets/game-qr.png')
print('Generated QR code:',url)
