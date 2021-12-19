from django.shortcuts import redirect
from django.core.cache import cache
import requests
from django.contrib.auth.models import User
from game.models.player.player import Player
from django.contrib.auth import login
from random import randint

def receive_code(request):
    data = request.GET
    code = data.get('code')
    state = data.get('state')
    # print('code',code, '    state:',state)

    if not cache.has_key(state):
        return redirect("global_index")

    cache.delete(state)

    apply_access_token_url = "https://www.acwing.com/third_party/api/oauth2/access_token/"
    params = {
            'appid': '817',
            'secret': '8c07b02b0d09416aafb7de0240fa29eb',
            'code': code
    }

    access_token_res = requests.get(apply_access_token_url, params=params).json()

    # print(access_token_res)
    access_token = access_token_res['access_token']
    openid = access_token_res['openid']

    players = Player.objects.filter(openid=openid)
    if players.exists():
        login(request, players[0].user) # 如果该用户已存在则无须重新获取用户信息，直接登录即可
        return redirect('global_index')

    get_userinfo_url = 'https://www.acwing.com/third_party/api/meta/identity/getinfo/'
    params = {
            "access_token": access_token,
            'openid': openid,
    }
    userinfo_res = requests.get(get_userinfo_url, params=params).json()
    username = userinfo_res['username']
    photo = userinfo_res['photo']

    while User.objects.filter(username=username).exists(): # 找到一个不重复的用户名
        username += str(randint(0,9))

    user = User.objects.create(username=username)
    player = Player.objects.create(user=user, photo=photo, openid=openid)

    login(request, user)

    return redirect("global_index") # 重定向到根目录url
