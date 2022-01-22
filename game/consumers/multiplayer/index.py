from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.conf import settings
from django.core.cache import cache

class MultiPlayer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        print('disconnect')
        await self.channel_layer.group_discard(self.room_name, self.channel_name);

    async def create_player(self, data):
        # 如果玩家房间中已经存在
        self.room_name = None
        start = 0
        find = False

        for room in cache.keys('*'):
            for player in cache.get(room):
                if player['uuid'] == data['uuid']:
                    self.room_name = room # 记录当前房间号
                    find = True
                    break
            if find: break

        if find:
            for player in cache.get(self.room_name):
                await self.send(text_data=json.dumps({
                    'event': 'create_player',
                    'uuid': player['uuid'],
                    'username': player['username'],
                    'photo': player['photo'],
                }))

            await self.channel_layer.group_add(self.room_name, self.channel_name)

            await self.channel_layer.group_send(
                self.room_name, 
                {
                    'type': 'group_send_event',
                    'event': 'create_player',
                    'uuid': player['uuid'],
                    'username': player['username'],
                    'photo': player['photo']
                }
            )

        if self.room_name is not None: return # 如果找到房间则断线重连，直接返回

        # if data['username'] != 'admin': start = 200 # 方便调试
        for i in range(start, start + 200):
            name = "room-%d" % (i)
            if not cache.has_key(name) or len(cache.get(name)) < settings.ROOM_CAPACITY: # 如果房间名没有创建或房间人数不满，使用该房间
                self.room_name = name
                break

        if not self.room_name: # 服务器房间无了
            return

        if not cache.has_key(self.room_name):
            cache.set(self.room_name, [], 1500) # 初始化房间为空列表，有效期 1500s

        for player in cache.get(self.room_name):
            await self.send(text_data=json.dumps({
                'event': 'create_player',
                'uuid': player['uuid'],
                'username': player['username'],
                'photo': player['photo'],
            }))

        await self.channel_layer.group_add(self.room_name, self.channel_name)
        players = cache.get(self.room_name)
        players.append({
            'uuid': data['uuid'],
            'username': data['username'],
            'photo': data['photo']
        })
        cache.set(self.room_name, players, 1500)

        await self.channel_layer.group_send(
            self.room_name, 
            {
                'type': 'group_send_event',
                'event': 'create_player',
                'uuid': data['uuid'],
                'username': data['username'],
                'photo': data['photo']
            }
        )

    async def group_send_event(self, data):
        await self.send(text_data=json.dumps(data))

    async def move_to(self, data):
        await self.channel_layer.group_send(
                    self.room_name,
                    {
                        'type': "group_send_event",
                        'event': 'move_to',
                        'uuid': data['uuid'],
                        'tx': data['tx'],
                        'ty': data['ty'],
                    }
                )
    async def shoot_fireball(self, data):
        print("shoot_fireball")
        await self.channel_layer.group_send(
                    self.room_name,
                    {
                        'type': 'group_send_event',
                        'event': 'shoot_fireball',
                        'uuid': data['uuid'],
                        'tx': data['tx'],
                        'ty': data['ty'],
                        'ball_uuid': data['ball_uuid'],
                    }
                )
    async def attack(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event': "attack",
                'uuid': data['uuid'],
                'attackee_uuid': data['attackee_uuid'],
                'x': data['x'],
                'y': data['y'],
                'angle': data['angle'],
                'damage': data['damage'],
                'ball_uuid': data['ball_uuid'],
            }
        )

    async def blink(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event': "blink",
                'uuid': data['uuid'],
                'tx': data['tx'],
                'ty': data['ty'],
            }
        )

    async def message(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_send_event",
                'event': "message",
                'uuid': data['uuid'],
                'username': data['username'],
                'text': data['text'],
            }
        )

    async def receive(self, text_data): # 路由
        data = json.loads(text_data)
        event = data['event']
        # print("需要进行的：", data)
        if event == "create_player": # 这里的数据来自前段 socket/multiplayer/zbase.js
            # print("执行了吗")
            await self.create_player(data)
        elif event == "move_to":
            await self.move_to(data)
        elif event == "shoot_fireball":
            await self.shoot_fireball(data)
        elif event == "attack":
            await self.attack(data)
        elif event == "blink":
            await self.blink(data)
        elif event == "message":
            await self.message(data)




