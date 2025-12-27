// Shared helpers (shop + admin)
const CAKINO = {
  keys:{
    products:"cakinoProducts",
    orders:"cakinoOrders",
    cart:"cakinoCart",
    draft:"cakinoDraft",
    adminAuth:"cakinoAdminAuth"
  },
  load(key, fallback){
    try{
      const raw = localStorage.getItem(key);
      if(raw === null || raw === undefined) return fallback;
      return JSON.parse(raw);
    }catch(e){
      return fallback;
    }
  },
  save(key, value){
    localStorage.setItem(key, JSON.stringify(value));
  },
  money(n){
    try{
      return (Number(n)||0).toLocaleString("fa-IR") + " تومان";
    }catch{
      return n + " تومان";
    }
  },
  qs(name){
    const u = new URL(location.href);
    return u.searchParams.get(name);
  }
};

function getProducts(){
  return CAKINO.load(CAKINO.keys.products, []);
}
function getOrders(){
  return CAKINO.load(CAKINO.keys.orders, []);
}
function saveOrders(orders){
  CAKINO.save(CAKINO.keys.orders, orders);
}
function findProduct(pid){
  return getProducts().find(p => p.id === pid);
}
