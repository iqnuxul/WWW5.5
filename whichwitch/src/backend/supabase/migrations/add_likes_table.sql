-- ============================================
-- 添加点赞功能
-- ============================================

-- 1. 创建点赞关系表
CREATE TABLE IF NOT EXISTS work_likes (
  id SERIAL PRIMARY KEY,
  work_id BIGINT NOT NULL,
  user_address VARCHAR(42) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (work_id) REFERENCES works(work_id) ON DELETE CASCADE,
  UNIQUE(work_id, user_address)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_work_likes_work ON work_likes(work_id);
CREATE INDEX IF NOT EXISTS idx_work_likes_user ON work_likes(user_address);

-- 2. 创建增加点赞数的函数
CREATE OR REPLACE FUNCTION increment_like_count(work_id_param BIGINT)
RETURNS void AS $$
BEGIN
  INSERT INTO work_stats (work_id, like_count, last_updated)
  VALUES (work_id_param, 1, NOW())
  ON CONFLICT (work_id) 
  DO UPDATE SET 
    like_count = work_stats.like_count + 1,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- 3. 创建减少点赞数的函数
CREATE OR REPLACE FUNCTION decrement_like_count(work_id_param BIGINT)
RETURNS void AS $$
BEGIN
  UPDATE work_stats
  SET 
    like_count = GREATEST(like_count - 1, 0),
    last_updated = NOW()
  WHERE work_id = work_id_param;
END;
$$ LANGUAGE plpgsql;

-- 4. 创建获取用户点赞状态的函数
CREATE OR REPLACE FUNCTION get_user_likes(user_addr VARCHAR, work_ids BIGINT[])
RETURNS TABLE(work_id BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT wl.work_id
  FROM work_likes wl
  WHERE wl.user_address = LOWER(user_addr)
    AND wl.work_id = ANY(work_ids);
END;
$$ LANGUAGE plpgsql;
