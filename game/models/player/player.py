# -*- coding:utf-8 -*-
from django.db import models # 数据库基类
from django.contrib.auth.models import User

class Player(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE) # 一一对应，当user删除，其关联的Player也要删除
    photo = models.URLField(max_length=256, blank=True) # 新增图片进数据库
    openid = models.CharField(default="", max_length=50, blank=True, null=True)
    giteeid = models.CharField(default="", max_length=50, blank=True, null=True)

    def __str__(self): # 数据库显示
        return str(self.user)
