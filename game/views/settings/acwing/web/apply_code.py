from django.http import JsonResponse
from urllib.parse import quote
from random import randint
from django.core.cache import cache

def get_state(): # 防止被恶意攻击
    res = ""
    for i in range(8):
        res += str(randint(0, 9))
    return res

def apply_code(request):
    appid = '817'
    redirect_url = quote("https://app817.acapp.acwing.com.cn/settings/acwing/web/receive_code/")
    scope = "userinfo"
    state = get_state()

    cache.set(state, True, 3600) # 有效期一个小时
    
    apply_code_url = "https://www.acwing.com/third_party/api/oauth2/web/authorize/"
    return JsonResponse({
        'result': "success",
        'apply_code_url': apply_code_url + \
                "?appid=%s&redirect_uri=%s&scope=%s&state=%s" % (appid, redirect_url, scope, state),
        })
