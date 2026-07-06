from PIL import Image, ImageDraw, ImageFont
import os
coords = {
  'Endrino': {'region':'Johto','x':86,'y':9},
  'Trigal': {'region':'Johto','x':46,'y':56},
  'Azalea': {'region':'Johto','x':46,'y':83},
  'Olivo': {'region':'Johto','x':19,'y':65},
  'Orquídea': {'region':'Johto','x':6,'y':32},
  'Caoba': {'region':'Johto','x':52,'y':24},
  'Malva': {'region':'Johto','x':82,'y':43},
  'Pueblo Azuliza': {'region':'Hoenn','x':10,'y':71},
  'Ciudad Férrica': {'region':'Hoenn','x':11,'y':14},
  'Ciudad Malvalona': {'region':'Hoenn','x':42,'y':51},
  'Ciudad Petalia': {'region':'Hoenn','x':26,'y':79},
  'Pueblo Lavacalda': {'region':'Hoenn','x':33,'y':16},
  'Ciudad Arborada': {'region':'Hoenn','x':72,'y':14},
  'Ciudad Vetusta': {'region':'Sinnoh','x':16,'y':18},
  'Ciudad Pirita': {'region':'Sinnoh','x':32,'y':55},
  'Ciudad Canal': {'region':'Sinnoh','x':9,'y':60},
  'Ciudad Rocavelo': {'region':'Sinnoh','x':77,'y':46},
  'Pueblo Pastoria': {'region':'Sinnoh','x':79,'y':78},
  'Carmín': {'region':'Kanto','x':59,'y':76},
  'Isla Canela': {'region':'Kanto','x':31,'y':90},
  'Plateada': {'region':'Kanto','x':18,'y':17},
  'Celeste': {'region':'Kanto','x':64,'y':18},
  'Azulona': {'region':'Kanto','x':38,'y':48},
  'Fucsia': {'region':'Kanto','x':84,'y':71},
  'Porcelana': {'region':'Unova','x':50,'y':78},
  'Mayólica': {'region':'Unova','x':45,'y':40},
  'Fayenza': {'region':'Unova','x':30,'y':45},
  'Loza': {'region':'Unova','x':22,'y':30},
  'Caolín': {'region':'Unova','x':55,'y':30},
  'Striaton': {'region':'Unova','x':84,'y':58}
}
region_files = {
  'Johto': 'public/images/maps/map_johto.png',
  'Hoenn': 'public/images/maps/map_hoenn.png',
  'Sinnoh': 'public/images/maps/map_sinnoh.png',
  'Kanto': 'public/images/maps/map_kanto.png',
  'Unova': 'public/images/maps/map_unova.png'
}
for region, path in region_files.items():
    if not os.path.exists(path):
        print('MISSING', path)
        continue
    img = Image.open(path).convert('RGBA')
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype('arial.ttf', 14)
    except Exception:
        font = ImageFont.load_default()
    for name, data in coords.items():
        if data['region'] != region:
            continue
        x = int(data['x'] * img.width / 100)
        y = int(data['y'] * img.height / 100)
        r = 12
        draw.ellipse((x-r, y-r, x+r, y+r), fill=(255,0,0,200), outline=(255,255,255,255), width=2)
        draw.text((x+14, y-10), name, fill=(255,255,255,255), font=font)
    out = f'temp_{region.lower()}.png'
    img.save(out)
    print('saved', out, 'size', img.size)
