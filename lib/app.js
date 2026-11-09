const ADMIN_PASSWORD = "123";
let isAdmin = localStorage.getItem('sutra_is_admin') === 'true';

let defaultProducts = [
    { id: 1, name: "عباية الحرير الملكي الأسود", category: "عبايات", price: 580, image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800", desc: "عباية فاخرة مصممة من أجود أقمشة الحرير الأسود مع مطرزات ذهبية دقيقة على الأكمام.", rating: 4.9, reviewsCount: 18 },
    { id: 2, name: "وشاح الشيفون المطرز باليد", category: "أوشحة", price: 160, image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=800", desc: "وشاح شيفون خفيف وناعم مزين بتطريزات يدوية راقية تضفي فخامة على إطلالتك.", rating: 4.7, reviewsCount: 12 },
    { id: 3, name: "عباية المخمل الكلاسيكية", category: "عبايات", price: 650, image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800", desc: "مصممة خصيصاً للمناسبات والأمسيات الشتوية الفاخرة بقماش مخمل دافئ وانسيابي.", rating: 5.0, reviewsCount: 25 },
    { id: 4, name: "وشاح الحرير الطبيعي الملون", category: "أوشحة", price: 210, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800", desc: "وشاح من حرير التوت الطبيعي بألوان متناسقة تضفي لمسة حيوية وأنيقة.", rating: 4.8, reviewsCount: 14 }
];

let products = JSON.parse(localStorage.getItem('sutra_products')) || defaultProducts;
let cart = JSON.parse(localStorage.getItem('sutra_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('sutra_wishlist')) || [];

let currentFilter = 'all';
let searchQuery = '';
let selectedSize = '52';
let activeProductForModal = null;
let discountPercentage = 0;

document.addEventListener('DOMContentLoaded', () => {
    checkAdminUI();
    renderProducts();
    updateBadges();
});

function promptAdminLogin() {
    if (isAdmin) {
        if (confirm('هل ترغب في تسجيل الخروج من لوحة المشرف؟')) {
            isAdmin = false;
            localStorage.setItem('sutra_is_admin', 'false');
            checkAdminUI();
            renderProducts();
        }
    } else {
        const pass = prompt("أدخل كلمة مرور المشرف لإدارة المتجر:");
        if (pass === ADMIN_PASSWORD) {
            isAdmin = true;
            localStorage.setItem('sutra_is_admin', 'true');
            alert("تم تسجيل الدخول كمشرف بنجاح!");
            checkAdminUI();
            renderProducts();
        } else if (pass !== null) {
            alert("كلمة المرور غير صحيحة!");
        }
    }
}

function checkAdminUI() {
    const addBtn = document.getElementById('admin-add-btn');
    const toggleBtn = document.getElementById('admin-toggle-btn');
    if (isAdmin) {
        addBtn.classList.remove('hidden');
        addBtn.classList.add('flex');
        toggleBtn.innerHTML = '<i class="fa-solid fa-unlock text-amber-400"></i> خروج المشرف';
    } else {
        addBtn.classList.add('hidden');
        addBtn.classList.remove('flex');
        toggleBtn.innerHTML = '<i class="fa-solid fa-lock"></i> دخول الإدارة';
    }
}

function deleteProduct(id) {
    if (!isAdmin) return;
    if (confirm("هل أنت متأكد من حذف هذا الموديل؟")) {
        products = products.filter(p => p.id !== id);
        localStorage.setItem('sutra_products', JSON.stringify(products));
        renderProducts();
    }
}

function handleSearch(query) {
    searchQuery = query.trim().toLowerCase();
    renderProducts();
}

function renderProducts() {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';
    
    let filtered = currentFilter === 'all' ? products : products.filter(p => p.category === currentFilter);
    
    if (searchQuery) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery) || p.desc.toLowerCase().includes(searchQuery));
    }
    
    if (filtered.length === 0) {
        grid.innerHTML = '<p class="col-span-full text-center text-neutral-500 py-12">لا توجد موديلات مطابقة لبحثك.</p>';
        return;
    }

    filtered.forEach(product => {
        const isWishlisted = wishlist.some(item => item.id === product.id);
        const card = document.createElement('div');
        card.className = "bg-[#121212] border border-neutral-900 rounded-2xl overflow-hidden hover:border-amber-600/40 transition duration-300 flex flex-col justify-between group shadow-lg relative";
        card.innerHTML = `
            <div class="relative h-80 bg-neutral-900 overflow-hidden cursor-pointer" onclick="openProductModal(${product.id})">
                <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                <span class="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-amber-400 text-[10px] font-bold px-3 py-1 rounded-full border border-amber-500/20">${product.category}</span>
                <button onclick="event.stopPropagation(); toggleWishlistProduct(${product.id})" class="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:text-amber-400 transition">
                    <i class="${isWishlisted ? 'fa-solid text-amber-400' : 'fa-regular'} fa-heart"></i>
                </button>
                ${isAdmin ? `<button onclick="event.stopPropagation(); deleteProduct(${product.id})" class="absolute bottom-3 left-3 bg-red-600/80 hover:bg-red-600 text-white text-xs px-2.5 py-1 rounded-md shadow"><i class="fa-solid fa-trash"></i> حذف</button>` : ''}
            </div>
            <div class="p-5 flex flex-col flex-grow justify-between">
                <div>
                    <div class="flex items-center gap-1 text-amber-400 text-xs mb-1">
                        <i class="fa-solid fa-star"></i>
                        <span class="font-bold">${product.rating || 4.8}</span>
                        <span class="text-neutral-500">(${product.reviewsCount || 10})</span>
                    </div>
                    <h3 class="font-bold text-white text-base mb-1 cursor-pointer hover:text-amber-400 transition" onclick="openProductModal(${product.id})">${product.name}</h3>
                    <p class="text-xs text-neutral-400 line-clamp-2 mb-4">${product.desc}</p>
                </div>
                <div class="flex items-center justify-between pt-4 border-t border-neutral-900">
                    <span class="text-base font-black text-amber-300">${product.price} درهم</span>
                    <button onclick="openProductModal(${product.id})" class="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-amber-300 px-4 py-2 rounded-xl text-xs font-bold transition">اختيار المقاس</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function filterCategory(category) {
    currentFilter = category;
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('bg-amber-500', 'text-black', 'shadow-lg');
        btn.classList.add('bg-neutral-900', 'text-neutral-300', 'border', 'border-neutral-800');
    });
    event.target.classList.remove('bg-neutral-900', 'text-neutral-300', 'border', 'border-neutral-800');
    event.target.classList.add('bg-amber-500', 'text-black', 'shadow-lg');
    renderProducts();
}

function openProductModal(id) {
    activeProductForModal = products.find(p => p.id === id);
    if (!activeProductForModal) return;

    document.getElementById('modal-img').src = activeProductForModal.image;
    document.getElementById('modal-category').innerText = activeProductForModal.category;
    document.getElementById('modal-title').innerText = activeProductForModal.name;
    document.getElementById('modal-price').innerText = activeProductForModal.price + ' درهم';
    document.getElementById('modal-desc').innerText = activeProductForModal.desc;

    document.getElementById('size-selection-area').style.display = activeProductForModal.category === 'أوشحة' ? 'none' : 'block';

    document.getElementById('product-modal').classList.remove('hidden');
    document.getElementById('product-modal').classList.add('flex');
}

function closeProductModal() {
    document.getElementById('product-modal').classList.add('hidden');
    document.getElementById('product-modal').classList.remove('flex');
}

function selectSize(btn) {
    document.querySelectorAll('.size-btn').forEach(b => {
        b.classList.remove('bg-amber-500', 'text-black', 'border-amber-500');
        b.classList.add('bg-neutral-900', 'text-white', 'border-neutral-800');
    });
    btn.classList.remove('bg-neutral-900', 'text-white', 'border-neutral-800');
    btn.classList.add('bg-amber-500', 'text-black', 'border-amber-500');
    selectedSize = btn.innerText;
}

function addCurrentProductToCart() {
    if (!activeProductForModal) return;
    const size = activeProductForModal.category === 'أوشحة' ? 'مقاس موحد' : selectedSize;
    
    const existingIndex = cart.findIndex(item => item.id === activeProductForModal.id && item.size === size);
    if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
    } else {
        cart.push({ ...activeProductForModal, size, qty: 1 });
    }

    saveAndSyncCart();
    closeProductModal();
    toggleCart();
}

function updateCartItemQty(index, change) {
    cart[index].qty += change;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    saveAndSyncCart();
}

function saveAndSyncCart() {
    localStorage.setItem('sutra_cart', JSON.stringify(cart));
    updateBadges();
    renderCartItems();
}

function toggleCart() {
    const drawer = document.getElementById('cart-drawer');
    if (drawer.classList.contains('hidden')) {
        drawer.classList.remove('hidden');
        drawer.classList.add('flex');
        renderCartItems();
    } else {
        drawer.classList.add('hidden');
        drawer.classList.remove('flex');
    }
}

function renderCartItems() {
    const container = document.getElementById('cart-items');
    container.innerHTML = '';

    if (cart.length === 0) {
        container.innerHTML = '<p class="text-center text-neutral-500 py-8 text-xs">سلة المشتريات فارغة.</p>';
        document.getElementById('cart-subtotal').innerText = '0 درهم';
        document.getElementById('cart-total').innerText = '0 درهم';
        return;
    }

    let subtotal = 0;
    cart.forEach((item, index) => {
        subtotal += item.price * item.qty;
        const div = document.createElement('div');
        div.className = "flex items-center justify-between bg-neutral-900/60 p-3 rounded-xl border border-neutral-800";
        div.innerHTML = `
            <div class="flex items-center gap-3">
                <img src="${item.image}" class="w-12 h-12 rounded-lg object-cover">
                <div>
                    <h4 class="text-xs font-bold text-white">${item.name}</h4>
                    <p class="text-[10px] text-neutral-400">المقاس: ${item.size} | ${item.price} درهم</p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="updateCartItemQty(${index}, -1)" class="w-6 h-6 rounded bg-neutral-800 text-white flex items-center justify-center text-xs">-</button>
                <span class="text-xs font-bold text-white">${item.qty}</span>
                <button onclick="updateCartItemQty(${index}, 1)" class="w-6 h-6 rounded bg-neutral-800 text-white flex items-center justify-center text-xs">+</button>
            </div>
        `;
        container.appendChild(div);
    });

    let discount = (subtotal * discountPercentage) / 100;
    let total = subtotal - discount;

    document.getElementById('cart-subtotal').innerText = subtotal + ' درهم';
    if (discount > 0) {
        document.getElementById('discount-row').style.display = 'flex';
        document.getElementById('cart-discount').innerText = '-' + discount.toFixed(0) + ' درهم';
    } else {
        document.getElementById('discount-row').style.display = 'none';
    }
    document.getElementById('cart-total').innerText = total.toFixed(0) + ' درهم';
}

function applyCoupon() {
    const code = document.getElementById('coupon-input').value.trim().toUpperCase();
    if (code === 'SUTRA10') {
        discountPercentage = 10;
        alert('تم تطبيق الخصم 10% بنجاح!');
        renderCartItems();
    } else {
        alert('كود الخصم غير صحيح.');
    }
}

function toggleWishlistProduct(id) {
    const index = wishlist.findIndex(item => item.id === id);
    if (index > -1) {
        wishlist.splice(index, 1);
    } else {
        const prod = products.find(p => p.id === id);
        if (prod) wishlist.push(prod);
    }
    localStorage.setItem('sutra_wishlist', JSON.stringify(wishlist));
    updateBadges();
    renderProducts();
}

function toggleWishlist() {
    const drawer = document.getElementById('wishlist-drawer');
    if (drawer.classList.contains('hidden')) {
        drawer.classList.remove('hidden');
        drawer.classList.add('flex');
        renderWishlistItems();
    } else {
        drawer.classList.add('hidden');
        drawer.classList.remove('flex');
    }
}

function renderWishlistItems() {
    const container = document.getElementById('wishlist-items');
    container.innerHTML = '';
    if (wishlist.length === 0) {
        container.innerHTML = '<p class="text-center text-neutral-500 py-8 text-xs">قائمة المفضلة فارغة.</p>';
        return;
    }
    wishlist.forEach(item => {
        const div = document.createElement('div');
        div.className = "flex items-center justify-between bg-neutral-900/60 p-3 rounded-xl border border-neutral-800";
        div.innerHTML = `
            <div class="flex items-center gap-3">
                <img src="${item.image}" class="w-12 h-12 rounded-lg object-cover">
                <div>
                    <h4 class="text-xs font-bold text-white">${item.name}</h4>
                    <p class="text-[10px] text-amber-400 font-bold">${item.price} درهم</p>
                </div>
            </div>
            <button onclick="toggleWishlistProduct(${item.id}); renderWishlistItems();" class="text-red-400 hover:text-red-300 text-xs"><i class="fa-solid fa-trash"></i></button>
        `;
        container.appendChild(div);
    });
}

function updateBadges() {
    const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
    const cartBadge = document.getElementById('cart-badge');
    cartBadge.classList.toggle('hidden', cartCount === 0);
    cartBadge.innerText = cartCount;

    const wishBadge = document.getElementById('wishlist-badge');
    wishBadge.classList.toggle('hidden', wishlist.length === 0);
    wishBadge.innerText = wishlist.length;
}

function checkoutWhatsApp() {
    if (cart.length === 0) return alert('السلة فارغة!');
    let message = "مرحباً، أرغب في إتمام طلب جديد من متجر سترة | SUTRA:\n\n";
    let subtotal = 0;
    cart.forEach((item, index) => {
        let itemTotal = item.price * item.qty;
        subtotal += itemTotal;
        message += `${index + 1}. ${item.name} (${item.size}) - الكمية: ${item.qty} - السعر: ${itemTotal} درهم\n`;
    });
    let discount = (subtotal * discountPercentage) / 100;
    let total = subtotal - discount;
    message += `\nالمجموع الإجمالي: ${total.toFixed(0)} درهم\nشكراً لكم!`;

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
}

let tempBase64Image = '';
function openAddModal() {
    document.getElementById('add-modal').classList.remove('hidden');
    document.getElementById('add-modal').classList.add('flex');
}
function closeAddModal() {
    document.getElementById('add-modal').classList.add('hidden');
    document.getElementById('add-modal').classList.remove('flex');
}

function convertImageToBase64(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            tempBase64Image = e.target.result;
            document.getElementById('new-image').value = tempBase64Image;
        };
        reader.readAsDataURL(file);
    }
}

function handleAddNewProduct(event) {
    event.preventDefault();
    const name = document.getElementById('new-name').value;
    const category = document.getElementById('new-category').value;
    const price = parseFloat(document.getElementById('new-price').value);
    const image = document.getElementById('new-image').value;
    const desc = document.getElementById('new-desc').value;

    products.unshift({
        id: Date.now(),
        name, category, price, image, desc,
        rating: 5.0, reviewsCount: 1
    });

    localStorage.setItem('sutra_products', JSON.stringify(products));
    renderProducts();
    closeAddModal();
    document.getElementById('add-product-form').reset();
    alert('تمت إضافة الموديل بنجاح!');
}
