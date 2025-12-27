// Customer-side flow: products -> customize -> delivery -> review -> success
(function(){
  const draftKey = CAKINO.keys.draft;

  function calcPricing(product, weightKg, message){
    const w = Number(weightKg) || 1;
    const subtotal = Math.round(w * (Number(product.pricePerKg)||0));
    const messageFee = (message && message.trim().length > 0) ? 35000 : 0;
    const shipping = 45000;
    const total = subtotal + messageFee + shipping;
    return { subtotal, messageFee, shipping, total };
  }

  function renderProducts(){
    const wrap = document.getElementById("productsList");
    if(!wrap) return;

    const products = getProducts();
    wrap.innerHTML = products.map(p => `
      <article class="product-card">
        <img src="${p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p><small>قیمت هر کیلو: ${CAKINO.money(p.pricePerKg)}</small></p>
        <div class="actions-row">
          <a class="btn btn-primary btn-small" href="customize.html?pid=${encodeURIComponent(p.id)}">سفارش و شخصی‌سازی</a>
        </div>
      </article>
    `).join("");
  }

  function renderCustomize(){
    const productNameEl = document.getElementById("productName");
    const productImgEl  = document.getElementById("productImg");
    const form = document.getElementById("customizeForm");
    if(!form) return;

    const pid = CAKINO.qs("pid") || "choco";
    const product = findProduct(pid) || getProducts()[0];
    if(productNameEl) productNameEl.textContent = product ? product.name : "کیک";
    if(productImgEl && product) productImgEl.src = product.image;

    // preload previous draft
    const prev = CAKINO.load(draftKey, null);
    if(prev && prev.item && prev.item.productId === pid){
      if(form.weightKg) form.weightKg.value = prev.item.weightKg || "1";
      if(form.flavor) form.flavor.value = prev.item.flavor || "";
      if(form.message) form.message.value = prev.item.message || "";
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const draft = CAKINO.load(draftKey, { item:{}, customer:{}, delivery:{} });
      draft.item = {
        productId: pid,
        weightKg: Number(form.weightKg.value || 1),
        flavor: form.flavor.value || "",
        message: form.message.value || ""
      };
      CAKINO.save(draftKey, draft);
      location.href = "delivery-info.html";
    });
  }

  function renderDelivery(){
    const form = document.getElementById("deliveryForm");
    if(!form) return;

    const draft = CAKINO.load(draftKey, { item:{}, customer:{}, delivery:{} });

    if(form.fullname) form.fullname.value = draft.customer?.name || "";
    if(form.phone) form.phone.value = draft.customer?.phone || "";
    if(form.address) form.address.value = draft.delivery?.address || "";
    if(form.date) form.date.value = draft.delivery?.date || "";
    if(form.time) form.time.value = draft.delivery?.time || "12 تا 15";

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      draft.customer = {
        name: form.fullname.value || "مشتری",
        phone: form.phone.value || ""
      };
      draft.delivery = {
        address: form.address.value || "",
        date: form.date.value || "",
        time: form.time.value || ""
      };
      CAKINO.save(draftKey, draft);
      location.href = "review-order.html";
    });
  }

  function renderReview(){
    const box = document.getElementById("reviewBox");
    const btn = document.getElementById("placeOrderBtn");
    if(!box || !btn) return;

    const draft = CAKINO.load(draftKey, null);
    if(!draft || !draft.item || !draft.item.productId){
      box.innerHTML = `<p>هیچ سفارشی برای بررسی وجود ندارد.</p><div class="actions-row"><a class="btn btn-primary" href="products.html">رفتن به صفحه سفارش</a></div>`;
      btn.style.display = "none";
      return;
    }

    const product = findProduct(draft.item.productId);
    if(!product){
      box.innerHTML = `<p>محصول انتخاب‌شده پیدا نشد.</p>`;
      btn.style.display = "none";
      return;
    }

    const pricing = calcPricing(product, draft.item.weightKg, draft.item.message);

    box.innerHTML = `
      <div class="order-summary">
        <h2>پیش‌فاکتور</h2>
        <div class="summary-row"><span>محصول</span><span>${product.name}</span></div>
        <div class="summary-row"><span>وزن</span><span>${draft.item.weightKg} کیلو</span></div>
        <div class="summary-row"><span>طعم</span><span>${draft.item.flavor || "—"}</span></div>
        <div class="summary-row"><span>متن روی کیک</span><span>${draft.item.message ? draft.item.message : "—"}</span></div>
        <div class="summary-row"><span>قیمت کیک</span><span>${CAKINO.money(pricing.subtotal)}</span></div>
        <div class="summary-row"><span>هزینه متن</span><span>${CAKINO.money(pricing.messageFee)}</span></div>
        <div class="summary-row"><span>ارسال</span><span>${CAKINO.money(pricing.shipping)}</span></div>
        <div class="summary-row total"><strong>مبلغ نهایی</strong><strong>${CAKINO.money(pricing.total)}</strong></div>
        <hr style="border:none;border-top:1px solid var(--border);margin:1rem 0">
        <h3>اطلاعات تحویل</h3>
        <p style="margin:.3rem 0"><strong>گیرنده:</strong> ${draft.customer?.name || "—"} ${draft.customer?.phone ? "— " + draft.customer.phone : ""}</p>
        <p style="margin:.3rem 0"><strong>آدرس:</strong> ${draft.delivery?.address || "—"}</p>
        <p style="margin:.3rem 0"><strong>تاریخ/بازه:</strong> ${draft.delivery?.date || "—"} — ${draft.delivery?.time || "—"}</p>
      </div>
    `;

    btn.addEventListener("click", () => {
      const orders = getOrders();

      const orderId = "CK-" + Date.now().toString(36).toUpperCase();
      const order = {
        id: orderId,
        createdAt: new Date().toISOString(),
        status: "pending",
        customer: draft.customer,
        delivery: draft.delivery,
        item: draft.item,
        pricing
      };

      orders.unshift(order);
      saveOrders(orders);
      localStorage.removeItem(draftKey);
      location.href = "order-success.html?orderId=" + encodeURIComponent(orderId);
    });
  }

  function renderSuccess(){
    const idEl = document.getElementById("orderId");
    if(!idEl) return;
    const oid = CAKINO.qs("orderId");
    idEl.textContent = oid ? oid : "—";
  }

  function renderCart(){
    // minimal cart page (draft-driven)
    const box = document.getElementById("cartBox");
    if(!box) return;

    const draft = CAKINO.load(draftKey, null);
    if(!draft || !draft.item || !draft.item.productId){
      box.innerHTML = `<div class="card"><h2>سبد خرید</h2><p>سبد خرید شما خالی است.</p><div class="actions-row"><a class="btn btn-primary" href="products.html">انتخاب کیک</a></div></div>`;
      return;
    }
    const product = findProduct(draft.item.productId);
    box.innerHTML = `
      <div class="card">
        <h2>سبد خرید</h2>
        <p><strong>محصول:</strong> ${product ? product.name : draft.item.productId}</p>
        <p><strong>وزن:</strong> ${draft.item.weightKg} کیلو</p>
        <div class="actions-row">
          <a class="btn btn-outline" href="customize.html?pid=${encodeURIComponent(draft.item.productId)}">ویرایش سفارش</a>
          <a class="btn btn-primary" href="delivery-info.html">ادامه و ثبت آدرس</a>
        </div>
      </div>
    `;
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderProducts();
    renderCustomize();
    renderDelivery();
    renderReview();
    renderSuccess();
    renderCart();
  });
})();
