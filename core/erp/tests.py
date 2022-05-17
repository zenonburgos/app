from config.wsgi import *
from core.erp.models import *

data = ['Audio', 'Video', 'Closets y Roperos',
        'Chineros', 'Módulos', 'Camarotes',
        'Camas Box Spring', 'Bicicletas',
        'Planchas para Pupusas', 'Refrigeración']

for i in data:
    cat = Category(name=i)
    cat.save()
    print('Guardado registro N°{}'.format(cat.id))
