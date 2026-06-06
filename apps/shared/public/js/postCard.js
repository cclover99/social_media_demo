window.addEventListener('pointerdown', (event) => {
  if (event.button === 1) {
    event.preventDefault(); 
  }
});

window.addEventListener('pointerup', async (event) => {
        const button = event.target.closest('[data-action="bookmark"], [data-action="like"], [data-action="repost"]');
        const post = event.target.closest('.post');
        
        if (!button && !post || ![0, 1].includes(event.button)) return;
        
        if (post && !button){
            // Don't if there's selection
            const sel = window.getSelection();
            const text = sel ? sel.toString().trim() : "";
            const hasSelectionInside = text && sel.rangeCount > 0 && divContainer.contains(sel.anchorNode) && divContainer.contains(sel.focusNode);
            if (hasSelectionInside) {console.log('selection'); return};
            
            if (event.button === 1) { event.preventDefault(); event.stopPropagation(); window.open(post.getAttribute('post-url'), '_blank', 'noopener') }
            else{ window.location.href = post.getAttribute('post-url') };
            return;
        }
        
        const postId = button.closest('.post')?.getAttribute('post-id');

        const action = button.dataset.action;
        switch (action) {
            case 'bookmark':
                button.classList.toggle('isBookmarked');
                try {
                    const result = await jsonQuery('/api/bookmark-post', JSON.stringify({ 'post_id': postId }));

                    if (result.ok != true) button.classList.toggle('isBookmarked');
                } catch (error) {
                    button.classList.toggle('isBookmarked');
                }
                break;

            case 'like':
                button.classList.toggle('isLiked');
                try {
                    const count = parseInt(button.innerText.match(/\d+/)?.[0] || "0", 10);
        
                    let isLiked = !button.classList.contains('isLiked');
                    const newCount = isLiked ? count - 1 : count + 1;
                    button.innerText = `Like ${newCount}`;

                    const result = await jsonQuery('/api/like-post', JSON.stringify({ 'post_id': postId }));

                    if (result.ok != true) {
                        button.classList.toggle('isBookmarked')

                        const count = parseInt(button.innerText.match(/\d+/)?.[0] || "0", 10);
        
                        let isLiked = !button.classList.contains('isLiked');
                        const newCount = isLiked ? count - 1 : count + 1;
                        button.innerText = `Like ${newCount}`;
                    };                    
                } catch (error) {
                    button.classList.toggle('isLiked');
                }
                break;
            

            // case 'repost':
            //     button.classList.toggle('isReposted');
            //     try {
            //         const result = await jsonQuery('/api/repost-post', JSON.stringify({ 'post_id': postId }));

            //         if (result.ok != true) button.classList.toggle('isBookmarked');
            //     } catch (error) {
            //         button.classList.toggle('isReposted');
            //     }
            //     break;
        };
    });


// If there's a delete button on the page
document.querySelector('.deleteButton')?.addEventListener('click', async (event) => {
    
    const postId = event.currentTarget.closest('.post')?.getAttribute('post-id');


    const result = await jsonQuery('/api/delete-post', JSON.stringify({"post_id": postId}));
    if (result?.ok == true){ 
        if (document.referrer) {
            // Redirect to the exact previous URL, forcing a fresh load
            window.location.replace(document.referrer);
        } else {
            // Fallback in case there is no referrer history
            window.history.back();
        };
    };  
});