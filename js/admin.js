// Admin panel: auth + manage products & orders
(function(){
  const ADMIN_USER = "admin";
  const ADMIN_PASS = "1234"; // demo only

  function isAuthed(){
    return localStorage.getItem(CAKINO.keys.adminAuth) === "1";
  }
  function requireAdmin(){
    if(!isAuthed()){
      location.href = "admin-login.html";
    }
  }
  function setActiveMenu(){
    const here = location.pathname.split("/").pop();
    document.querySelectorAll(".admin-menu a").forEach(a => {
      if(a.getAttribute("href") === here) a.classList.add("active");
    });
  }

  function adminLogin(){
    const form = document.getElementById("adminLoginForm");
    if(!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const u = form.username.value.trim();
      const p = form.password.value.trim();

      if(u === ADMIN_USER && p === ADMIN_PASS){
        localStorage.setItem(CAKINO.keys.adminAuth, "1");
        location.href = "admin-dashboard.html";
        return;
      }
      alert("نام کاربری یا رمز عبور اشتباه است. (دمو: admin / 1234)");
    });
  }

  function adminLogout(){
    const btn = document.getElementById("adminLogout");
    if(!btn) return;
    btn.addEventListener("click", () => {
      localStorage.removeItem(CAKINO.keys.adminAuth);
      location.href = "admin-login.html";
    });
  }

  function renderKPIs(){
    const kpiWrap = document.getElementById("kpis");
    if(!kpiWrap) return;
    requireAdmin();

    const orders = getOrders();
    const pending = orders.filter(o => o.status === "pending").length;
    const preparing = orders.filter(o => o.status === "preparing").length;
    const delivered = orders.filter(o => o.status === "delivered").length;

    const revenue = orders
      .filter(o => o.status === "delivered" || o.status === "preparing")
      .reduce((sum,o) => sum + (Number(o.pricing?.total)||0), 0);

    kpiWrap.innerHTML = `
      <div class="kpi"><div class="num">${orders.length.toLocaleString("fa-IR")}</div><div>کل سفارش‌ها</div></div>
      <div class="kpi"><div class="num">${pending.toLocaleString("fa-IR")}</div><div>در انتظار تایید</div></div>
      <div class="kpi"><div class="num">${CAKINO.money(revenue)}</div><div>درآمد (حداقلی/دمو)</div></div>
    `;

    const quick = document.getElementById("latestOrders");
    if(quick){
      const rows = orders.slice(0,5).map(o => `
        <tr>
          <td>${o.id}</td>
          <td>${o.customer?.name || "—"}</td>
          <td>${statusBadge(o.status)}</td>
          <td>${CAKINO.money(o.pricing?.total || 0)}</td>
        </tr>
      `).join("");
      quick.innerHTML = rows || `<tr><td colspan="4">سفارشی ثبت نشده است.</td></tr>`;
    }
  }

  function statusBadge(status){
    const map = {
      pending: {t:"در انتظار", c:"warning"},
      preparing: {t:"در حال آماده‌سازی", c:""},
      delivered: {t:"تحویل‌شده", c:"success"},
      cancelled: {t:"لغوشده", c:"danger"}
    };
    const s = map[status] || {t:status, c:""};
    return `<span class="badge ${s.c}">${s.t}</span>`;
  }

  function renderOrders(){
    const tbody = document.getElementById("ordersBody");
    if(!tbody) return;
    requireAdmin();

    const orders = getOrders();
    tbody.innerHTML = orders.map(o => `
      <tr>
        <td>${o.id}</td>
        <td>${o.customer?.name || "—"}<br><small>${o.customer?.phone || ""}</small></td>
        <td>${o.item?.productId || "—"}<br><small>${(o.item?.weightKg||"—")} کیلو — ${(o.item?.flavor||"—")}</small></td>
        <td>${o.delivery?.time || "—"}<br><small>${o.delivery?.date || ""}</small></td>
        <td>${CAKINO.money(o.pricing?.total || 0)}</td>
        <td>
          <select data-oid="${o.id}">
            <option value="pending" ${o.status==="pending"?"selected":""}>در انتظار</option>
            <option value="preparing" ${o.status==="preparing"?"selected":""}>آماده‌سازی</option>
            <option value="delivered" ${o.status==="delivered"?"selected":""}>تحویل</option>
            <option value="cancelled" ${o.status==="cancelled"?"selected":""}>لغو</option>
          </select>
        </td>
        <td><button class="btn btn-small btn-outline" data-save="${o.id}">ذخیره</button></td>
      </tr>
    `).join("");

    tbody.querySelectorAll("[data-save]").forEach(btn => {
      btn.addEventListener("click", () => {
        const oid = btn.getAttribute("data-save");
        const sel = tbody.querySelector(`select[data-oid="${oid}"]`);
        const newStatus = sel ? sel.value : "pending";
        const orders2 = getOrders().map(x => x.id === oid ? ({...x, status:newStatus}) : x);
        saveOrders(orders2);
        alert("وضعیت سفارش ذخیره شد.");
      });
    });
  }

  function renderProducts(){
    const tbody = document.getElementById("productsBody");
    if(!tbody) return;
    requireAdmin();

    const products = getProducts();
    tbody.innerHTML = products.map(p => `
      <tr>
        <td>${p.id}</td>
        <td>${p.name}</td>
        <td>${CAKINO.money(p.pricePerKg)}</td>
        <td>${p.category || "—"}</td>
        <td class="admin-actions">
          <button class="icon-btn icon-btn-sm icon-btn--primary" type="button" data-edit="${p.id}" aria-label="ویرایش محصول" title="ویرایش">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm2.92 2.83H5v-.92l9.06-9.06.92.92L5.92 20.08zM20.71 7.04a1.003 1.003 0 000-1.42L18.37 3.29a1.003 1.003 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.83z"></path>
            </svg>
          </button>
          <button class="icon-btn icon-btn-sm icon-btn--danger" type="button" data-del="${p.id}" aria-label="حذف محصول" title="حذف">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M6 7h12v2H6V7zm2 3h8l-1 10H9L8 10zm3-6h2l1 1h5v2H5V5h5l1-1z"></path>
            </svg>
          </button>
        </td>
      </tr>
    `).join("") || `<tr><td colspan="5">محصولی وجود ندارد.</td></tr>`;

    // add / edit form
    const form = document.getElementById("productForm");
    const modeEl = document.getElementById("formMode");
    if(!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = form.pid.value.trim();
      const name = form.pname.value.trim();
      const price = Number(form.pprice.value || 0);
      const cat = form.pcat.value.trim();
      const img = form.pimg.value.trim() || "assests/images/cocoa-cake.jpg";

      if(!id || !name || !price){
        alert("شناسه، نام و قیمت الزامی است.");
        return;
      }

      const list = getProducts();
      const exists = list.find(x => x.id === id);
      if(exists){
        // update
        const upd = list.map(x => x.id===id ? ({...x, name, pricePerKg:price, category:cat, image:img}) : x);
        CAKINO.save(CAKINO.keys.products, upd);
        modeEl.textContent = "افزودن محصول";
        form.reset();
        form.pid.disabled = false;
        renderProducts();
        return;
      }

      list.push({ id, name, pricePerKg:price, category:cat, image:img });
      CAKINO.save(CAKINO.keys.products, list);
      form.reset();
      renderProducts();
    });

    tbody.querySelectorAll("[data-edit]").forEach(b => {
      b.addEventListener("click", () => {
        const id = b.getAttribute("data-edit");
        const p = getProducts().find(x => x.id === id);
        if(!p) return;
        modeEl.textContent = "ویرایش محصول";
        form.pid.value = p.id;
        form.pid.disabled = true;
        form.pname.value = p.name;
        form.pprice.value = p.pricePerKg;
        form.pcat.value = p.category || "";
        form.pimg.value = p.image || "";
        window.scrollTo({top:0, behavior:"smooth"});
      });
    });

    tbody.querySelectorAll("[data-del]").forEach(b => {
      b.addEventListener("click", () => {
        const id = b.getAttribute("data-del");
        if(!confirm("حذف شود؟")) return;
        const list = getProducts().filter(x => x.id !== id);
        CAKINO.save(CAKINO.keys.products, list);
        renderProducts();
      });
    });
  }

  function renderCustomers(){
    const tbody = document.getElementById("customersBody");
    if(!tbody) return;
    requireAdmin();

    const orders = getOrders();
    const map = {};
    orders.forEach(o => {
      const ph = o.customer?.phone || "";
      if(!ph) return;
      if(!map[ph]) map[ph] = { phone: ph, name: o.customer?.name || "—", orders: 0, total: 0 };
      map[ph].orders += 1;
      map[ph].total += Number(o.pricing?.total || 0);
    });
    const customers = Object.values(map).sort((a,b)=>b.orders-a.orders);

    tbody.innerHTML = customers.map(c => `
      <tr>
        <td>${c.name}</td>
        <td>${c.phone}</td>
        <td>${c.orders.toLocaleString("fa-IR")}</td>
        <td>${CAKINO.money(c.total)}</td>
      </tr>
    `).join("") || `<tr><td colspan="4">اطلاعات مشتری ثبت نشده است.</td></tr>`;
  }

  document.addEventListener("DOMContentLoaded", () => {
    adminLogin();
    adminLogout();
    setActiveMenu();

    renderKPIs();
    renderOrders();
    renderProducts();
    renderCustomers();

    // guard for all admin pages except login
    if(location.pathname.endsWith("admin-login.html")) return;
    if(document.querySelector(".admin-wrap")) requireAdmin();
  });
})();
