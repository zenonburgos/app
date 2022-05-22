from django import forms


class ResetPasswordForm(forms.Form):
    username = forms.CharField(widget=forms.TextInput(attrs={
        'placeholder': 'Ingrese un Username',
        'class': 'form-control',
        'autocomplete': 'off'
    }))
