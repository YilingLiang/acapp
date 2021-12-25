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
    client_id = 'a066847fdc9cabd999c8b575f5ec3e8b282269c40b20cd78c28399bd0d036855'
    redirect_url = quote("https://app817.acapp.acwing.com.cn/settings/gitee/receive_code/")
    scope = "user_info"
    response_type = "code"
    state = get_state()

    cache.set(state, True, 3600) # 有效期一个小时
    
    apply_code_url = "https://gitee.com/oauth/authorize/"
    return JsonResponse({
        'result': "success",
        'apply_code_url': apply_code_url + \
                "?client_id=%s&redirect_uri=%s&scope=%s&response_type=%s&state=%s" % (client_id, redirect_url, scope, response_type, state),
        })

