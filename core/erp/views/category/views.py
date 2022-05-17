from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from django.http import JsonResponse, HttpResponseRedirect
from django.shortcuts import render, redirect
from django.urls import reverse_lazy
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import ListView, CreateView, UpdateView, DeleteView, FormView
from django.utils.decorators import method_decorator

from core.erp.forms import CategoryForm
from core.erp.mixins import IsSuperuserMixin, ValidatePermissionRequiredMixin
from core.erp.models import Category, Product


def category_list(request):
    data = {
        'title': 'Listado de Categorías',
        'categories': Category.objects.all()
    }
    return render(request, 'category/list.html', data)


class CategoryListView(LoginRequiredMixin, ValidatePermissionRequiredMixin, ListView):
    permission_required = 'erp.view_category'
    model = Category
    template_name = 'category/list.html'

    @method_decorator(csrf_exempt)
    # @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        data = {}
        try:
            # print(request.POST)
            # data = Category.objects.get(pk=request.POST['id']).toJSON()
            action = request.POST['action']
            if action == 'searchdata':
                data = []
                for i in Category.objects.all():
                    data.append(i.toJSON())
            else:
                data['error'] = 'Ha ocurrido un error'
        except Exception as e:
            data['error'] = str(e)
        return JsonResponse(data, safe=False)

        # try:
        #     action = request.POST['action']
        #     if action == 'searchdata':
        #         data = []
        #         for i in Category.objects.all():
        #             data.append(i.toJSON())
        #         else:
        #             data['error'] = 'Ha ocurrido un error'
        #     # data = Category.objects.get(pk=request.POST['id']).toJSON()
        # except Exception as e:
        #     data['error'] = str(e)
        # return JsonResponse(data, safe=False)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(*kwargs)
        context['title'] = 'Listado de Categorías'
        context['create_url'] = reverse_lazy('erp:category_create')
        context['list_url'] = reverse_lazy('erp:category_list')
        context['entity'] = 'Categorías'
        # context['object_list'] = Product.objects.all()
        return context


class CategoryCreateView(ValidatePermissionRequiredMixin, CreateView):
    permission_required = 'erp.add_category'
    url_redirect = reverse_lazy('erp:category_list')
    model = Category
    form_class = CategoryForm
    template_name = 'category/create.html'
    success_url = reverse_lazy('erp:category_list')

    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        # self.object = self.get_object()
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        data = {}
        try:
            action = request.POST['action']
            if action == 'add':
                form = self.get_form()
                data = form.save()
            else:
                data['error'] = 'No ha ingresado a ninguna opción'
        except Exception as e:
            data['error'] = str(e)
        return JsonResponse(data)

    #     form = CategoryForm(request.POST)
    #     if form.is_valid():
    #         form.save()
    #         return HttpResponseRedirect(self.success_url)
    #     self.object = None
    #     context = self.get_context_data(**kwargs)
    #     context['form'] = form
    #     return render(request, self.template_name, context)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Crear una Categoría'
        context['entity'] = 'Categorías'
        context['list_url'] = reverse_lazy('erp:category_list')
        context['action'] = 'add'
        return context


class CategoryUpdateView(UpdateView):
    model = Category
    form_class = CategoryForm
    template_name = 'category/create.html'
    success_url = reverse_lazy('erp:category_list')

    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        self.object = self.get_object()
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        data = {}
        try:
            action = request.POST['action']
            if action == 'edit':
                form = self.get_form()
                data = form.save()
            else:
                data['error'] = 'No ha ingresado a ninguna opción'
        except Exception as e:
            data['error'] = str(e)
        return JsonResponse(data)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Editar una Categoría'
        context['entity'] = 'Categorías'
        context['list_url'] = reverse_lazy('erp:category_list')
        context['action'] = 'edit'
        return context


class CategoryDeleteView(DeleteView):
    model = Category
    template_name = 'category/delete.html'
    success_url = reverse_lazy('erp:category_list')

    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        self.object = self.get_object()
        return super().dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        data = {}
        try:
            self.object.delete()
        except Exception as e:
            data['error'] = str(e)
        return JsonResponse(data)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Eliminar una Categoría'
        context['entity'] = 'Categorías'
        context['list_url'] = reverse_lazy('erp:category_list')
        return context


class CategoryFormView(FormView):
    form_class = CategoryForm
    template_name = 'category/create.html'
    success_url = reverse_lazy('erp:category_list')

    def form_valid(self, form):
        return super().form_valid(form)

    def form_invalid(self, form):
        print(form.errors)
        return super().form_invalid(form)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Form | Categoría'
        context['entity'] = 'Categorías'
        context['list_url'] = reverse_lazy('erp:category_list')
        context['action'] = 'add'
        return context
