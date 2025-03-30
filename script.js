document.addEventListener('DOMContentLoaded', function() {
    document.body.classList.add('loaded');
    
    if (!localStorage.getItem('monospaceFirstVisit')) {
        setTimeout(() => {
            document.getElementById('welcomeModal').classList.add('active');
        }, 800);
        localStorage.setItem('monospaceFirstVisit', 'true');
    } else {
        setTimeout(() => {
            document.getElementById('welcomeModal').classList.add('active');
        }, 800);
    }
    
    const newPostBtn = document.getElementById('newPostBtn');
    const clearBtn = document.getElementById('clearBtn');
    const postForm = document.getElementById('postForm');
    const postTitle = document.getElementById('postTitle');
    const postContent = document.getElementById('postContent');
    const submitPostBtn = document.getElementById('submitPostBtn');
    const postsContainer = document.getElementById('postsContainer');
    const themeToggle = document.getElementById('themeToggle');
    const currentYear = document.getElementById('currentYear');
    const closeModalBtn = document.getElementById('closeModal');
    const welcomeModal = document.getElementById('welcomeModal');
    const confirmationModal = document.getElementById('confirmationModal');
    const closeConfirmationModal = document.getElementById('closeConfirmationModal');
    const confirmationMessage = document.getElementById('confirmationMessage');
    const confirmActionBtn = document.getElementById('confirmActionBtn');
    const cancelActionBtn = document.getElementById('cancelActionBtn');
    
    let currentAction = null;
    let currentPostId = null;
    let isEditMode = false;
    
    currentYear.textContent = new Date().getFullYear();
    
    let posts = JSON.parse(localStorage.getItem('monospacePosts')) || [];
    if (posts.length === 0) {
        const demoPost = {
            id: Date.now(),
            title: "Welcome to Monospace Journal",
            content: "Hello! 👋\n\nThis is your first journal post.\nYou can edit or delete this post and create your own.\n\nWrite your thoughts, ideas, or anything else that comes to mind.",
            date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        };
        savePost(demoPost);
        posts = [demoPost];
    }
    
    loadPosts();
    
    newPostBtn.addEventListener('click', togglePostForm);
    clearBtn.addEventListener('click', () => showConfirmation('clear'));
    submitPostBtn.addEventListener('click', submitPost);
    themeToggle.addEventListener('click', toggleTheme);
    closeModalBtn.addEventListener('click', closeModal);
    closeConfirmationModal.addEventListener('click', closeConfirmationModalFunc);
    cancelActionBtn.addEventListener('click', closeConfirmationModalFunc);
    confirmActionBtn.addEventListener('click', executeCurrentAction);
    welcomeModal.addEventListener('click', function(e) {
        if (e.target === welcomeModal) {
            closeModal();
        }
    });
    confirmationModal.addEventListener('click', function(e) {
        if (e.target === confirmationModal) {
            closeConfirmationModalFunc();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && postForm.classList.contains('active')) {
            submitPost();
        }
        
        if (e.key === 'Escape' && postForm.classList.contains('active')) {
            postForm.classList.remove('active');
            isEditMode = false;
            currentPostId = null;
            postTitle.value = '';
            postContent.value = '';
        }
        
        if (e.key === 'Escape' && welcomeModal.classList.contains('active')) {
            closeModal();
        }
        
        if (e.key === 'Escape' && confirmationModal.classList.contains('active')) {
            closeConfirmationModalFunc();
        }
    });
    
    const savedTheme = localStorage.getItem('monospaceTheme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="ri-sun-line"></i>';
    } else {
        themeToggle.innerHTML = '<i class="ri-moon-line"></i>';
    }
    
    function togglePostForm() {
        if (postForm.classList.contains('active')) {
            postForm.classList.remove('active');
            isEditMode = false;
            currentPostId = null;
            postTitle.value = '';
            postContent.value = '';
        } else {
            postForm.classList.add('active');
            postTitle.focus();
        }
    }
    
    function closeModal() {
        welcomeModal.classList.remove('active');
    }
    
    function closeConfirmationModalFunc() {
        currentAction = null;
        currentPostId = null;
        confirmationModal.classList.remove('active');
    }
    
    function showConfirmation(action, postId = null) {
        currentAction = action;
        currentPostId = postId;
        
        let message = '';
        switch (action) {
            case 'delete':
                message = 'Are you sure you want to delete this post? This action cannot be undone.';
                break;
            case 'clear':
                message = 'Are you sure you want to clear all posts? This action cannot be undone.';
                break;
            default:
                return;
        }
        
        confirmationMessage.textContent = message;
        confirmationModal.classList.add('active');
    }
    
    function executeCurrentAction() {
        if (!currentAction) return;
        
        switch (currentAction) {
            case 'delete':
                deletePost(currentPostId);
                break;
            case 'clear':
                clearAllPosts();
                break;
        }
        
        closeConfirmationModalFunc();
    }
    
    function submitPost() {
        const title = postTitle.value.trim();
        const content = postContent.value.trim();
        
        if (title && content) {
            const post = {
                id: Date.now(),
                title,
                content,
                date: new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };
            
            if (isEditMode) {
                updatePost(currentPostId, post);
            } else {
                savePost(post);
            }
            
            postTitle.value = '';
            postContent.value = '';
            postForm.classList.remove('active');
            isEditMode = false;
            currentPostId = null;
        }
    }
    
    function savePost(post) {
        let posts = JSON.parse(localStorage.getItem('monospacePosts')) || [];
        posts.unshift(post);
        localStorage.setItem('monospacePosts', JSON.stringify(posts));
        loadPosts();
    }
    
    function updatePost(postId, updatedPost) {
        let posts = JSON.parse(localStorage.getItem('monospacePosts')) || [];
        const index = posts.findIndex(post => post.id === postId);
        
        if (index !== -1) {
            updatedPost.id = postId;
            posts[index] = updatedPost;
            localStorage.setItem('monospacePosts', JSON.stringify(posts));
            loadPosts();
        }
    }
    
    function deletePost(postId) {
        let posts = JSON.parse(localStorage.getItem('monospacePosts')) || [];
        posts = posts.filter(post => post.id !== postId);
        localStorage.setItem('monospacePosts', JSON.stringify(posts));
        loadPosts();
    }
    
    function clearAllPosts() {
        const defaultPost = {
            id: Date.now(),
            title: "Fresh Start",
            content: "You've cleared all posts. This is a new beginning.\n\nWrite your first entry.",
            date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        };
        
        localStorage.setItem('monospacePosts', JSON.stringify([defaultPost]));
        loadPosts();
    }
    
    function loadPosts() {
        postsContainer.innerHTML = '';
        const posts = JSON.parse(localStorage.getItem('monospacePosts')) || [];
        
        if (posts.length === 0) {
            clearAllPosts();
            return;
        }
        
        posts.forEach(post => {
            const postElement = createPostElement(post);
            postsContainer.appendChild(postElement);
            
            setTimeout(() => {
                postElement.classList.add('visible');
            }, 100);
        });
    }
    
    function createPostElement(post) {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.dataset.id = post.id;
        
        postElement.innerHTML = `
            <h2 class="post-title">${post.title}</h2>
            <div class="post-date">${post.date}</div>
            <div class="post-content">${post.content}</div>
            <div class="post-actions">
                <button class="edit-post-btn">EDIT</button>
                <button class="delete-post-btn warning">DELETE</button>
            </div>
        `;
        
        const editBtn = postElement.querySelector('.edit-post-btn');
        const deleteBtn = postElement.querySelector('.delete-post-btn');
        
        editBtn.addEventListener('click', () => editPost(post.id));
        deleteBtn.addEventListener('click', () => showConfirmation('delete', post.id));
        
        return postElement;
    }
    
    function editPost(postId) {
        const posts = JSON.parse(localStorage.getItem('monospacePosts')) || [];
        const postToEdit = posts.find(post => post.id === postId);
        
        if (postToEdit) {
            postTitle.value = postToEdit.title;
            postContent.value = postToEdit.content;
            postForm.classList.add('active');
            isEditMode = true;
            currentPostId = postId;
            postTitle.focus();
        }
    }
    
    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('monospaceTheme', 'dark');
            themeToggle.innerHTML = '<i class="ri-sun-line"></i>';
        } else {
            localStorage.setItem('monospaceTheme', 'light');
            themeToggle.innerHTML = '<i class="ri-moon-line"></i>';
        }
    }
    
    setTimeout(() => {
        document.body.classList.remove('loading');
    }, 100);
});