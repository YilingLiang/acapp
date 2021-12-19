from django.shortcuts import render

def index(request):
    return render(request, "multiends/web.html") # 这个路径在settings.py中是有的
