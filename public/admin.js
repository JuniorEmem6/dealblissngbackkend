const apiUrl = "/api/coupons";

// Load all coupons when the page loads
document.addEventListener("DOMContentLoaded", loadCoupons);

async function loadCoupons() {
  try {
    const response = await fetch(apiUrl);
    const coupons = await response.json();

    const couponTable = document.getElementById("couponTable");
    couponTable.innerHTML = "";

    coupons.forEach((coupon) => {
      const row = document.createElement("tr");

      row.innerHTML = `
                <td data-label="Description">&nbsp; ${coupon.description}</td>
                <td data-label="Discount">&nbsp; ${coupon.discount}</td>
                <td data-label="Code">${coupon.code}</td>
                <td data-label="Used">${coupon.used}</td>
                <td data-label="Actions" class="actions">
                    <button class="btn edit" onclick="editCoupon('${coupon._id}')">Edit</button>
                    <button class="btn danger" onclick="deleteCoupon('${coupon._id}')">Delete</button>
                </td>
            `;

      couponTable.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading coupons:", error);
  }
}

document
  .getElementById("couponForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const description = document.getElementById("description").value;
    const discount = document.getElementById("discount").value;
    const code = document.getElementById("code").value;
    const link = document.getElementById("link").value; // Get link value

    try {
      await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, discount, code, link }),
      });

      document.getElementById("couponForm").reset();
      loadCoupons();
    } catch (error) {
      console.error("Error adding coupon:", error);
    }
  });

async function deleteCoupon(id) {
  try {
    await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
    loadCoupons();
  } catch (error) {
    console.error("Error deleting coupon:", error);
  }
}

async function editCoupon(id) {
  const newDescription = prompt("Enter new description:");
  const newCode = prompt("Enter new code:");
  const newLink = prompt("Enter new link (e.g., https://example.com):");

  if (newDescription && newCode && newLink) {
    try {
      await fetch(`${apiUrl}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offer: newDescription,
          code: newCode,
          link: newLink,
        }),
      });

      loadCoupons();
    } catch (error) {
      console.error("Error editing coupon:", error);
    }
  }
}
