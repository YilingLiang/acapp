from django.contrib.auth import login
from django.contrib.auth.models import User
from game.models.player.player import Player
from django.http import JsonResponse

def register(request):
    data = request.GET
    print("register时:", request.GET.get("username"))
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()
    password_confirm = data.get("password_confirm", "").strip()
    if not username or not password:
        return JsonResponse({
            'result': "用户名或密码不能为空",
        })
    if password != password_confirm:
        return JsonResponse({
            'result': "两次输入的密码不一致"
        })
    if User.objects.filter(username=username).exists():
        return JsonResponse({
            'result': "用户名已存在"
        })

    user = User(username=username)
    user.set_password(password)
    user.save()
    imgurl = "https://cdn.jsdelivr.net/gh/yilingliang/cdn/img/lnbe.png"
    Player.objects.create(user=user, photo=imgurl)
    login(request, user)
    return JsonResponse({
        'result': "注册成功"
    })

