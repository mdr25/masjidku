// Mock API Client using localStorage
// This replaces the axios-based apiClient for demonstration purposes
import TEMPLATE_CATALOG from '../data/templates.js';

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

const getSlug = () => {
  const user = JSON.parse(localStorage.getItem("mid_current_user"));
  return user?.slug || user?.mosque_slug || "masjid-demo"; // fallback
};

// Initialize Mock Database
const initDB = () => {
  if (!localStorage.getItem("mock_users")) {
    localStorage.setItem("mock_users", JSON.stringify([]));
  }
  if (!localStorage.getItem("mock_mosques")) {
    localStorage.setItem("mock_mosques", JSON.stringify({}));
  }
  if (!localStorage.getItem("mock_posts")) {
    localStorage.setItem("mock_posts", JSON.stringify({}));
  }
};

initDB();

export const authService = {
  login: async (email, password) => {
    await delay(800);
    const users = JSON.parse(localStorage.getItem("mock_users") || "[]");
    let user = users.find(u => u.email === email && u.password === password);
    
    // Auto-create for demo if not found, or just return a default
    if (!user) {
      if (email && password) {
         user = { id: Date.now(), name: "Admin Demo", email, password, slug: "masjid-demo" };
      } else {
         throw { response: { data: { message: "Email atau password salah." } } };
      }
    }

    const mosques = JSON.parse(localStorage.getItem("mock_mosques") || "{}");
    const mosque = mosques[user.slug] || null;

    const token = "mock-token-" + Date.now();
    localStorage.setItem("mid_auth_token", token);

    const userToSave = {
      ...user,
      isSetupComplete: user.isSetupComplete || (mosque?.address ? true : false),
    };
    localStorage.setItem("mid_current_user", JSON.stringify(userToSave));

    return {
      data: {
        success: true,
        data: {
          user: userToSave,
          mosque: mosque,
          token
        }
      }
    };
  },
  
  register: async (data) => {
    await delay(800);
    const users = JSON.parse(localStorage.getItem("mock_users") || "[]");
    if (users.find(u => u.email === data.email)) {
      throw { response: { data: { message: "Email sudah terdaftar." } } };
    }
    
    const newUser = {
      id: Date.now(),
      name: data.name,
      email: data.email,
      password: data.password,
      slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    };
    
    users.push(newUser);
    localStorage.setItem("mock_users", JSON.stringify(users));
    
    return { data: { success: true, data: { user: newUser } } };
  },

  logout: async () => {
    await delay(300);
    localStorage.removeItem("mid_auth_token");
    localStorage.removeItem("mid_current_user");
    return { success: true };
  },

  getCurrentUser: () => JSON.parse(localStorage.getItem("mid_current_user")),
  isAuthenticated: () => !!localStorage.getItem("mid_auth_token"),
  fetchUser: async () => {
    await delay(300);
    return { data: { data: JSON.parse(localStorage.getItem("mid_current_user")) } };
  },
};

export const onboardingService = {
  checkDomain: async (slug) => {
    await delay(800);
    // Let's assume the domain is always available for demo
    return { data: { success: true, message: "Domain tersedia." } };
  },
  
  setDomain: async (slug) => {
    await delay(800);
    const user = authService.getCurrentUser();
    if (user) {
      user.slug = slug;
      localStorage.setItem("mid_current_user", JSON.stringify(user));
      
      const users = JSON.parse(localStorage.getItem("mock_users") || "[]");
      const index = users.findIndex(u => u.id === user.id);
      if (index !== -1) {
        users[index].slug = slug;
        localStorage.setItem("mock_users", JSON.stringify(users));
      }
      
      const mosques = JSON.parse(localStorage.getItem("mock_mosques") || "{}");
      if (!mosques[slug]) {
        mosques[slug] = { slug };
        localStorage.setItem("mock_mosques", JSON.stringify(mosques));
      }
    }
    return { data: { success: true } };
  },

  getTemplates: async () => {
    await delay(300);
    return {
      data: {
        data: TEMPLATE_CATALOG,   // ← sumber data terpusat
      }
    };
  },

  selectTemplate: async (templateCode) => {
    await delay(500);
    const slug = getSlug();
    const mosques = JSON.parse(localStorage.getItem("mock_mosques") || "{}");
    if (!mosques[slug]) mosques[slug] = {};
    mosques[slug].template_code = templateCode;
    localStorage.setItem("mock_mosques", JSON.stringify(mosques));
    return { data: { success: true } };
  },

  updateProfile: async (slug, data) => {
    await delay(800);
    const mosques = JSON.parse(localStorage.getItem("mock_mosques") || "{}");
    mosques[slug] = { ...mosques[slug], ...data };
    localStorage.setItem("mock_mosques", JSON.stringify(mosques));
    
    const user = authService.getCurrentUser();
    if (user) {
      user.isSetupComplete = true;
      localStorage.setItem("mid_current_user", JSON.stringify(user));

      const users = JSON.parse(localStorage.getItem("mock_users") || "[]");
      const index = users.findIndex(u => u.id === user.id);
      if (index !== -1) {
        users[index].isSetupComplete = true;
        localStorage.setItem("mock_users", JSON.stringify(users));
      }
    }

    return { data: { success: true, data: mosques[slug] } };
  },
};

export const dashboardService = {
  getProfile: async () => {
    await delay(500);
    const slug = getSlug();
    const mosques = JSON.parse(localStorage.getItem("mock_mosques") || "{}");
    return { data: { data: mosques[slug] || {} } };
  },
  updateProfile: async (data) => {
    return onboardingService.updateProfile(getSlug(), data);
  },
};

export const postService = {
  getPosts: async () => {
    await delay(500);
    const slug = getSlug();
    const allPosts = JSON.parse(localStorage.getItem("mock_posts") || "{}");
    const posts = allPosts[slug] || [];
    return { data: { data: posts } };
  },
  
  getPost: async (id) => {
    await delay(300);
    const slug = getSlug();
    const allPosts = JSON.parse(localStorage.getItem("mock_posts") || "{}");
    const post = (allPosts[slug] || []).find(p => p.id == id);
    return { data: { data: post } };
  },

  createPost: async (data) => {
    await delay(500);
    const slug = getSlug();
    const allPosts = JSON.parse(localStorage.getItem("mock_posts") || "{}");
    if (!allPosts[slug]) allPosts[slug] = [];
    
    const newPost = { is_published: false, ...data, id: Date.now(), created_at: new Date().toISOString() };
    allPosts[slug].push(newPost);
    localStorage.setItem("mock_posts", JSON.stringify(allPosts));
    
    return { data: { success: true, data: newPost } };
  },

  updatePost: async (id, data) => {
    await delay(500);
    const slug = getSlug();
    const allPosts = JSON.parse(localStorage.getItem("mock_posts") || "{}");
    const index = (allPosts[slug] || []).findIndex(p => p.id == id);
    if (index !== -1) {
      allPosts[slug][index] = { ...allPosts[slug][index], ...data };
      localStorage.setItem("mock_posts", JSON.stringify(allPosts));
    }
    return { data: { success: true } };
  },

  deletePost: async (id) => {
    await delay(500);
    const slug = getSlug();
    const allPosts = JSON.parse(localStorage.getItem("mock_posts") || "{}");
    if (allPosts[slug]) {
      allPosts[slug] = allPosts[slug].filter(p => p.id != id);
      localStorage.setItem("mock_posts", JSON.stringify(allPosts));
    }
    return { data: { success: true } };
  },

  publishPost: async (id) => {
    await delay(500);
    const slug = getSlug();
    const allPosts = JSON.parse(localStorage.getItem("mock_posts") || "{}");
    const index = (allPosts[slug] || []).findIndex(p => p.id == id);
    if (index !== -1) {
      allPosts[slug][index].is_published = true;
      localStorage.setItem("mock_posts", JSON.stringify(allPosts));
    }
    return { data: { success: true } };
  },

  unpublishPost: async (id) => {
    await delay(500);
    const slug = getSlug();
    const allPosts = JSON.parse(localStorage.getItem("mock_posts") || "{}");
    const index = (allPosts[slug] || []).findIndex(p => p.id == id);
    if (index !== -1) {
      allPosts[slug][index].is_published = false;
      localStorage.setItem("mock_posts", JSON.stringify(allPosts));
    }
    return { data: { success: true } };
  },
};

export const publicService = {
  getMasjidProfile: async (slug) => {
    await delay(500);
    const mosques = JSON.parse(localStorage.getItem("mock_mosques") || "{}");
    return { data: { data: mosques[slug] || {} } };
  },
  getMasjidPosts: async (slug, type = "") => {
    await delay(500);
    const allPosts = JSON.parse(localStorage.getItem("mock_posts") || "{}");
    let posts = allPosts[slug] || [];
    if (type) {
      posts = posts.filter(p => p.type === type);
    }
    return { data: { data: posts.filter(p => p.is_published) } };
  },
  getMasjidPostDetail: async (slug, postSlug) => {
    await delay(300);
    const allPosts = JSON.parse(localStorage.getItem("mock_posts") || "{}");
    const post = (allPosts[slug] || []).find(p => p.slug === postSlug);
    return { data: { data: post } };
  },
};

export const prayerService = {
  getProvinces: async () => ({ data: { data: [] } }), // fallback
  getCities: async (data) => ({ data: { data: [] } }),
  getSchedule: async (data) => ({ data: { data: {} } }),
};

// GeoService using Vite Proxy to bypass browser/CORS/Adblock blocks
export const geoService = {
  getProvinces: () => fetch("/api-wilayah/api/v1/public/masjidbesar/provinces").then(r => r.json()).then(data => ({ data })),
  getRegencies: (provinceId) => fetch(`/api-wilayah/api/v1/public/masjidbesar/regencies/${provinceId}`).then(r => r.json()).then(data => ({ data })),
  getDistricts: (regencyId) => fetch(`/api-wilayah/api/v1/public/masjidbesar/districts/${regencyId}`).then(r => r.json()).then(data => ({ data })),
  getVillages: (districtId) => fetch(`/api-wilayah/api/v1/public/masjidbesar/villages/${districtId}`).then(r => r.json()).then(data => ({ data })),
};

export default { authService, onboardingService, dashboardService, postService, publicService, prayerService, geoService };
