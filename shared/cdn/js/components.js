class components {
    /**
     * Creates a reusable Follow/Unfollow Button
     * @param {boolean} isFollowing - Initial state
     * @param {function} onClickCallbacks - What happens when clicked
     */
    static followButton(isFollowing, onClickCallback) {
        const button = document.createElement('button');
        
        // Setup initial styles and text
        button.className = isFollowing ? 'btn-following' : 'btn-follow';
        button.innerText = isFollowing ? 'Following' : 'Follow';
        
        // Attach event listener
        button.addEventListener('click', async (e) => {
            // Prevent spamming while the server processes
            button.disabled = true; 
            
            const success = await onClickCallback();
            
            if (success) {
                // Toggle state visually
                isFollowing = !isFollowing;
                button.className = isFollowing ? 'btn-following' : 'btn-follow';
                button.innerText = isFollowing ? 'Following' : 'Follow';
            }
            
            button.disabled = false;
        });

        return button;
    }

    /**
     * Creates a reusable Profile Preview Card
     */
    static profilePreview(user) {
        const card = document.createElement('div');
        card.className = 'profile-preview-card';
        
        card.innerHTML = `
            <img src="${user.profile_pic || '/default.png'}" class="avatar" />
            <div class="user-info">
                <h4>${user.username}</h4>
            </div>
        `;
        
        // You can even combine them! Nest the follow button inside the card:
        const btn = this.followButton(user.is_following, async () => {
            // Your API fetch call logic goes here
            return true;
        });
        
        card.appendChild(btn);
        return card;
    }
}