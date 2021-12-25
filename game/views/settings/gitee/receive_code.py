from django.shortcuts import redirect
from django.core.cache import cache
import requests
from django.contrib.auth.models import User
from game.models.player.player import Player
from django.contrib.auth import login
from random import randint

def receive_code(request):
    data = request.GET
    code = data.get('code', '')
    state = data.get('state', '')
    print('code',code, '\n\n\n\n', 'state:',state)

    #如果请求失败，code拿不到值，就用空字符串代替，故用户拒绝后也能重定向到回调地址处。
    if not cache.has_key(state) or code == '':
        return redirect("global_index")

    cache.delete(state)

    # apply_access_token_url = "https://gitee.com/oauth/token/"
    apply_access_token_url = "https://gitee.com/oauth/token/"
    params = {
            'grant_type': 'authorization_code',
            'code': code,
            'client_id': 'a066847fdc9cabd999c8b575f5ec3e8b282269c40b20cd78c28399bd0d036855',
            'redirect_uri': "https://app817.acapp.acwing.com.cn/settings/gitee/receive_code/",
            'client_secret': '93a87b4c69eeb3b0336ee490eb04f81f8fe36c94c03e97e6df4b6e3261ef83d7',
    }

    # access_token_res = requests.get(apply_access_token_url, params=params).json()
    #注意码云这里是通过Post方式进行请求。
    access_token_res = requests.post(apply_access_token_url, params=params).json()
    access_token = access_token_res['access_token']
    # print(access_token_res)

    get_userinfo_url = "https://gitee.com/api/v5/user/"
    params = {
            'access_token': access_token,
    }

    message = requests.get(get_userinfo_url, params=params)
    userinfo_res = message.json()

    giteeid = userinfo_res.get('id')
    username = userinfo_res.get('name')
    photo = userinfo_res.get('avatar_url')

    players = Player.objects.filter(giteeid=giteeid)
    if players.exists():
	#每次授权并将头像更新一遍。
        Player.objects.filter(giteeid=giteeid).update(photo=photo)
        login(request, players[0].user) # 如果该用户已存在则无须重新获取用户信息，直接登录即可
        return redirect('global_index')

    while User.objects.filter(username=username).exists(): # 找到一个不重复的用户名
        username += str(randint(0,9))

    user = User.objects.create(username=username)
    player = Player.objects.create(user=user, photo=photo, giteeid=giteeid)

    login(request, user)

    return redirect("global_index") # 重定向到根目录url

