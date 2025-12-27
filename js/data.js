// Seed data for Cakino (online cake ordering) - stored in localStorage
(function(){
  const PRODUCTS_KEY = "cakinoProducts";
  const ORDERS_KEY   = "cakinoOrders";

  const defaultProducts = [
    { id:"choco", name:"کیک تولد شکلاتی", pricePerKg: 520000, image:"assests/images/cocoa-cake.jpg", category:"تولد" },
    { id:"strawberry", name:"کیک خامه‌ای توت‌فرنگی", pricePerKg: 480000, image:"assests/images/strawberry-cake.jpg", category:"تولد" },
    { id:"vanilla", name:"کیک وانیلی کلاسیک", pricePerKg: 430000, image:"assests/images/vanilla-cake.jpg", category:"کلاسیک" },
    { id:"redvelvet", name:"کیک ردولوت", pricePerKg: 590000, image:"assests/images/redvelvet-cake.jpg", category:"خاص" }
  ];

  const now = new Date();
  const sampleOrders = [
    {
      id:"CK-" + (Date.now()-86400000).toString(36).toUpperCase(),
      createdAt: new Date(now.getTime()-86400000).toISOString(),
      status:"pending",
      customer:{ name:"مریم حسینی", phone:"09120000001" },
      delivery:{ address:"اصفهان، خیابان ...", date:"", time:"12 تا 15" },
      item:{ productId:"choco", weightKg:2, flavor:"شکلاتی", message:"تولدت مبارک" },
      pricing:{ subtotal:1040000, shipping:45000, total:1085000 }
    },
    {
      id:"CK-" + (Date.now()-43200000).toString(36).toUpperCase(),
      createdAt: new Date(now.getTime()-43200000).toISOString(),
      status:"preparing",
      customer:{ name:"علی محمدی", phone:"09120000002" },
      delivery:{ address:"اصفهان، میدان ...", date:"", time:"18 تا 21" },
      item:{ productId:"strawberry", weightKg:1, flavor:"توت‌فرنگی", message:"" },
      pricing:{ subtotal:480000, shipping:45000, total:525000 }
    }
  ];

  if(!localStorage.getItem(PRODUCTS_KEY)){
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(defaultProducts));
  }
  if(!localStorage.getItem(ORDERS_KEY)){
    localStorage.setItem(ORDERS_KEY, JSON.stringify(sampleOrders));
  }
})();
