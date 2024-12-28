function copyCode(code) {
    navigator.clipboard.writeText(code).then(() => {
        alert(`Code ${code} copied to clipboard!`);
    }).catch(err => {
        alert('Failed to copy code. Please try again.');
    });
}

function handleCouponClick(couponId) {
    fetch(`/api/coupons/${couponId}/click`, { method: 'POST' })
        .then(response => response.json())  // This will now work since the backend returns JSON
        .then(data => console.log('Coupon clicked:', data))  // data will be the JSON object
        .catch(err => console.error('Error updating coupon click:', err));
}

// Function to set a cookie
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Cookie expiration
    document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
}

// Function to get a cookie value by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

function handleThumbClick(couponId, buttonId) {
    // Check if the user has already clicked a button for this coupon
    const clickedThumb = getCookie(`clickedThumb-${couponId}`);
    if (clickedThumb) {
        // If already clicked, do not proceed further
        return;
    }

    const thumbsUpButton = document.getElementById(`thumbs-up-${couponId}`);
    const thumbsDownButton = document.getElementById(`thumbs-down-${couponId}`);
    const thumbsUpImg = thumbsUpButton.querySelector('img');
    const thumbsDownImg = thumbsDownButton.querySelector('img');

    // Reset button styles
    thumbsUpImg.src = '/thumb-up.png';
    thumbsDownImg.src = '/thumb-down.png';
    thumbsUpButton.classList.remove('clicked');
    thumbsDownButton.classList.remove('clicked');

    // Update button styles based on click
    if (buttonId === 'thumbs-up') {
        thumbsUpButton.classList.add('clicked');
        thumbsUpImg.src = '/thumb-up-green.png';
        fetch(`/api/coupons/${couponId}/thumbs-up`, { method: 'POST' })
            .catch(err => console.error('Error recording thumbs up:', err));
    } else if (buttonId === 'thumbs-down') {
        thumbsDownButton.classList.add('clicked');
        thumbsDownImg.src = '/thumb-down-green.png';
        fetch(`/api/coupons/${couponId}/thumbs-down`, { method: 'POST' })
            .catch(err => console.error('Error recording thumbs down:', err));
    }

    // Store user action in a cookie to prevent multiple clicks
    setCookie(`clickedThumb-${couponId}`, buttonId, 1);
}


document.addEventListener('DOMContentLoaded', () => {
    // Fetch coupons after the page loads
    fetch('/api/coupons')
        .then(response => response.json())
        .then(coupons => {
            const couponCtn = document.getElementsByClassName("couponCtn")[0];

            coupons.forEach(coupon => {
                let couponBox = document.createElement("div");
                couponBox.innerHTML = `
                    <div class="coupon">
                        <div class="coupon-details">
                            <h3>${coupon.offer}</h3>
                        </div>
                        <div class="coupon-extras">
                            <div class="coupon-codeCtn">
                                <div class="coupon-code">${coupon.code}</div>
                                <img class="copy" src="/copy.png" onclick="copyCode('${coupon.code}')" alt="">
                            </div>  
                            <div class="thumbs-up-extras">
                                <div class="thumbs">
                                    <button id="thumbs-up-${coupon._id}" class="thumbs-button" 
                                            onclick="handleThumbClick('${coupon._id}', 'thumbs-up')">
                                        <img src="/thumb-up.png" alt="">
                                    </button>
                                    <button id="thumbs-down-${coupon._id}" class="thumbs-button" 
                                            onclick="handleThumbClick('${coupon._id}', 'thumbs-down')">
                                        <img src="/thumb-down.png" alt="">
                                    </button>
                                </div>
                                <div class="view-stats">
                                    <p class="success">100% SUCCESS</p> 
                                    <div class="stats"><img src="/view.png" alt=""><p id="click-count-${coupon._id}">${coupon.used} Used - ${coupon.today} Today</p></div>
                                </div>
                                </div>
                                </div>
                                </div>
                                <a target="_blank" href="${coupon.link}" 
                                    onclick="handleCouponClick('${coupon._id}');">
                                    <div class="buyNowBtn">Shop Now</div>
                                </a>
                `;
                couponCtn.append(couponBox);

                // Initialize the thumbs state for this coupon after it has been added to the DOM
                const clickedThumb = getCookie(`clickedThumb-${coupon._id}`);
                const thumbsUpButton = document.getElementById(`thumbs-up-${coupon._id}`);
                const thumbsDownButton = document.getElementById(`thumbs-down-${coupon._id}`);
                const thumbsUpImg = thumbsUpButton.querySelector('img');
                const thumbsDownImg = thumbsDownButton.querySelector('img');

                // Apply the appropriate state
                if (clickedThumb === 'thumbs-up') {
                    thumbsUpButton.classList.add('clicked');
                    thumbsUpImg.src = '/thumb-up-green.png';
                } else if (clickedThumb === 'thumbs-down') {
                    thumbsDownButton.classList.add('clicked');
                    thumbsDownImg.src = '/thumb-down-green.png';
                }
            });
        })
        .catch(err => console.error('Error fetching coupons:', err));
});

const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("nav-links");

hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navLinks.classList.toggle("active");
});
