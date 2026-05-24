const db = require('#config/db');
const mediaService = require('#shared/src/services/mediaService');

exports.syncFollows = async (username) => {
    await db.query(`
        UPDATE users AS u
        JOIN follows AS f ON f.follower_id = :userId
        SET u.follower_count = u.follower_count - 1 
        WHERE f.following_id = u.id;`
    );
};


// Delete post and relating data
// Assumes post deletion is authorized
exports.deletePost = async (post_id) => {
    const [[{parent_post_id, media}]] = (await db.query('SELECT parent_post_id, media FROM posts WHERE post_id = ?', [post_id]));

    if (media?.length){
        for (const m of JSON.parse(media[0])){
            try{ 
                await mediaService.deletePostMedia(m);
            } catch{ 
                console.log('Error deleting post media');
                return;
            };
        };
    };

    // Decrement the comment count of the parent post
    if (parent_post_id){
        await db.query('UPDATE posts SET comment_count = comment_count - 1 WHERE post_id = ?', [parent_post_id]);
    };

    // Delete the post itself, and likes and bookmarks relating to the post
    // Order matters
    await db.query('DELETE FROM likes WHERE post_id = ?', [post_id]);
    await db.query('DELETE FROM bookmarks WHERE post_id = ?', [post_id]);
    await db.query('DELETE FROM posts WHERE post_id = ?', [post_id]);
};