const apiUrl = '/api/coupons';

// Load all coupons when the page loads
document.addEventListener('DOMContentLoaded', loadCoupons);

async function loadCoupons() {
    try {
        const response = await fetch(apiUrl);
        const coupons = await response.json();

        const couponTable = document.getElementById('couponTable');
        couponTable.innerHTML = '';

        coupons.forEach((coupon) => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td data-label="Offer">&nbsp; ${coupon.offer}</td>
                <td data-label="Code">${coupon.code}</td>
                <td data-label="Used">${coupon.used}</td>
                <td data-label="Today">${coupon.today}</td>
                <td data-label="Thumbs Up">${coupon.thumbsUp}</td>
                <td data-label="Thumbs Down">${coupon.thumbsDown}</td>
                <td data-label="Actions" class="actions">
                    <button class="btn edit" onclick="editCoupon('${coupon._id}')">Edit</button>
                    <button class="btn danger" onclick="deleteCoupon('${coupon._id}')">Delete</button>
                </td>
            `;

            couponTable.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading coupons:', error);
    }
}

document.getElementById('couponForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const offer = document.getElementById('offer').value;
    const code = document.getElementById('code').value;
    const link = document.getElementById('link').value; // Get link value

    try {
        await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ offer, code, link }),
        });

        document.getElementById('couponForm').reset();
        loadCoupons();
    } catch (error) {
        console.error('Error adding coupon:', error);
    }
});

async function deleteCoupon(id) {
    try {
        await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
        loadCoupons();
    } catch (error) {
        console.error('Error deleting coupon:', error);
    }
}

async function editCoupon(id) {
    const newOffer = prompt('Enter new offer:');
    const newCode = prompt('Enter new code:');
    const newLink = prompt('Enter new link (e.g., https://example.com):');

    if (newOffer && newCode && newLink) {
        try {
            await fetch(`${apiUrl}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ offer: newOffer, code: newCode, link: newLink }),
            });

            loadCoupons();
        } catch (error) {
            console.error('Error editing coupon:', error);
        }
    }
}
