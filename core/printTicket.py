from config.wsgi import *
from django.template.loader import get_template
os.add_dll_directory(r"C:\Program Files\GTK3-Runtime Win64\bin")
from weasyprint import HTML, CSS
from config import settings

def printTicket():
    template = get_template("ticket.html")
    context = {"name": "Antonio Burgos"}
    html_template = template.render(context)
    css_url = os.path.join(settings.BASE_DIR, 'static/lib/plantilla/libs/bootstrap/css/bootstrap.min.css')
    HTML(string=html_template).write_pdf(target="ticket.pdf", stylesheets=[CSS(css_url)])

printTicket()