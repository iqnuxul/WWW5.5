-- 清理无效的作品记录
-- 问题：work_id = 0 的记录导致后续上传失败

-- 1. 查看 work_id = 0 的记录
SELECT * FROM works WHERE work_id = 0;

-- 2. 查看依赖这些记录的数据
-- 检查收藏
SELECT * FROM collections WHERE work_id = 0;

-- 检查点赞
SELECT * FROM work_likes WHERE work_id = 0;

-- 检查授权
SELECT * FROM authorization_requests WHERE work_id = 0;

-- 3. 删除依赖数据（如果需要）
-- 注意：这会删除所有 work_id = 0 的相关数据
-- 如果你想保留某些数据，请先备份

-- 删除收藏
DELETE FROM collections WHERE work_id = 0;

-- 删除点赞
DELETE FROM work_likes WHERE work_id = 0;

-- 删除授权请求
DELETE FROM authorization_requests WHERE work_id = 0;

-- 4. 删除 work_id = 0 的作品记录
DELETE FROM works WHERE work_id = 0;

-- 5. 添加约束防止 work_id = 0
-- 注意：这会防止未来插入 work_id = 0 的记录
ALTER TABLE works ADD CONSTRAINT work_id_not_zero CHECK (work_id > 0);

-- 6. 验证清理结果
SELECT COUNT(*) as remaining_invalid_works FROM works WHERE work_id = 0;

-- 应该返回 0
