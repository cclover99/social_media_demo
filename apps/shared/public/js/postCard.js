    async function likePost(button){
        const result = await jsonQuery('/api/like-post', JSON.stringify({'post_id': '{{ post.post_id }}'}));
        
        // If anything were to go wrong with the query then return
        if (!result?.ok == true){ return };

        button.classList.toggle('isLiked');
        
        
        const count = parseInt(button.innerText.match(/\d+/)?.[0] || "0", 10);
        
        let isLiked = !button.classList.contains('isLiked');
        const newCount = isLiked ? count - 1 : count + 1;
        button.innerText = `Like ${newCount}`;
    }

    function replyPost(button){};

    function repostPost(){};

    async function bookmarkPost(button){
        button.classList.toggle('isBookmarked');
        const result = await jsonQuery('/api/bookmark-post', JSON.stringify({'post_id': '{{ post.post_id }}'}));
    }


    async function deletePost(button){
        const result = await jsonQuery('/api/delete-post', JSON.stringify({"post_id": '{{ post.post_id }}'}));
        if (result?.ok == true){ 
            if (document.referrer) {
                // Redirect to the exact previous URL, forcing a fresh load
                window.location.replace(document.referrer);
            } else {
                // Fallback in case there is no referrer history
                window.history.back();
            };
        };  
    };