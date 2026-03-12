-- Fix broken hero_image_url for articles in the database
-- Run this in Supabase SQL editor if articles show broken images

UPDATE articles
SET hero_image_url = 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&q=80'
WHERE title ILIKE '%RAG-arkitektur%'
  AND (hero_image_url IS NULL OR hero_image_url = '' OR hero_image_url ILIKE '%unsplash.com/photo-1526374965328%');

UPDATE articles
SET hero_image_url = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=80'
WHERE title ILIKE '%nybörjar%' AND title ILIKE '%ML%'
  AND (hero_image_url IS NULL OR hero_image_url = '');

UPDATE articles
SET hero_image_url = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=80'
WHERE title ILIKE '%nybörjar%' AND title ILIKE '%Python%'
  AND (hero_image_url IS NULL OR hero_image_url = '');

-- Set a safe fallback for any article with a null/empty hero image
UPDATE articles
SET hero_image_url = 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80'
WHERE hero_image_url IS NULL OR hero_image_url = '';
