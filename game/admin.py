from django.contrib import admin
# 将自己的表注册到后台管理页面
# Register your models here.
from game.models.player.player import Player

admin.site.register(Player)
