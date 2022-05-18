from django.shortcuts import render
from django.views.generic import TemplateView


class ReportSaleView(TemplateView):
    template_name = 'sale/report.html'
