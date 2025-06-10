-- Add more video records to match existing files
INSERT INTO videos (title, description, poem_text, video_url, cover_image_url, hashtags, content_type, uploaded_by_id, created_at, updated_at, view_count, like_count) 
VALUES 
('Sample Video 2', 'Another test video with existing files', 'Sample poem text', 'videos/5af9ab80-1a02-4614-bee4-6c9730578336.MOV', 'covers/84f48179-9487-49ba-a3e5-c934a87c70e0.png', 'test,sample', 'FREE', 10, NOW(), NOW(), 0, 0),
('Sample Video 3', 'Third test video with available media', 'Another sample poem', 'videos/62a8e8d9-53a3-497d-a3de-cf57e03cdf89.mp4', 'covers/c27f2415-db15-4ede-ab12-4a72b228aa26.png', 'demo,content', 'FREE', 10, NOW(), NOW(), 0, 0),
('Sample Video 4', 'Fourth test video for demo', 'Demo poem content', 'videos/75862ae2-564b-412b-89db-108d8abb4387.mp4', 'covers/d4a3122e-3c4a-4692-8a84-0bb9392c72b4.png', 'demo,test', 'PREMIUM', 10, NOW(), NOW(), 0, 0);
