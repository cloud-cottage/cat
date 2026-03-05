# 用户名迁移记录

## 迁移信息
- **日期**: 2026-03-05
- **操作**: 用户名从 'aa' 迁移到 'k'
- **状态**: ✅ 完成

## 迁移详情

### 原用户数据 (user:aa)
```json
{
  "id": "id_963ggobmmcs5hzs",
  "walletAddress": "0x59f9f640D15EBb053C94A816232cf8CE91b209b0",
  "username": "aa",
  "themeId": 3,
  "twitterHandle": "",
  "avatarUrl": "",
  "bio": "",
  "createdAt": "2026-03-05T01:21:41.464Z",
  "updatedAt": "2026-03-05T01:33:32.832Z"
}
```

### 新用户数据 (user:k)
```json
{
  "id": "id_963ggobmmcs5hzs",
  "walletAddress": "0x59f9f640D15EBb053C94A816232cf8CE91b209b0",
  "username": "k",
  "themeId": 3,
  "twitterHandle": "",
  "avatarUrl": "",
  "bio": "",
  "createdAt": "2026-03-05T01:21:41.464Z",
  "updatedAt": "2026-03-05T12:32:15.694Z"
}
```

### 迁移的链接 (4个)
1. **百度** - https://baidu.com
2. **新链接** - https://accounts.binance.com/en/register?ref=ID421J3O
3. **OKX** - https://www.okx.com/join/value
4. **Bitget** - https://share.bitget.com/u/8B78KZPB

## Redis 键值变更

### 旧键 (保留作备份)
- `user:aa` - 用户信息
- `links:aa` - 用户链接

### 新键 (当前使用)
- `user:k` - 用户信息
- `links:k` - 用户链接

## 访问方式

现在用户可以通过以下方式访问：
- 前端: `https://k.catcat.meme`
- API: `https://www.catcat.meme/api/user-kv?username=k`

## 验证结果

✅ 用户数据迁移成功
✅ 链接数据迁移成功 (4个链接)
✅ 所有链接的 userId 已更新为 'k'
✅ 用户名字段已更新
✅ 时间戳已更新

## 注意事项

- 旧数据 `user:aa` 和 `links:aa` 仍保留在 Redis 中
- 如需清理旧数据，可手动删除
- 建议保留一段时间作为备份
