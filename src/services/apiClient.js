// API Client using Axios
import api from "../utils/api.js";

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

const getSlug = () => {
  const user = JSON.parse(localStorage.getItem("mid_current_user"));
  return user?.slug || user?.mosque_slug;
};

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post("/v1/auth/login", { email, password });
      const { user, mosque, token } = response.data.data;

      const userToSave = {
        ...user,
        isSetupComplete:
          user.isSetupComplete || (mosque?.address ? true : false),
        slug: mosque?.slug || user.slug,
      };

      localStorage.setItem("mid_auth_token", token);
      localStorage.setItem("mid_current_user", JSON.stringify(userToSave));

      return {
        data: {
          success: true,
          data: {
            user: userToSave,
            mosque,
            token,
          },
        },
      };
    } catch (error) {
      if (error.response) throw error;
      throw { response: { data: { message: "Email atau password salah." } } };
    }
  },

  register: async (data) => {
    try {
      const response = await api.post("/v1/auth/register", data);
      const { user, mosque, token } = response.data.data;

      const userToSave = {
        ...user,
        isSetupComplete: false,
        slug: mosque?.slug || user.slug,
      };

      localStorage.setItem("mid_auth_token", token);
      localStorage.setItem("mid_current_user", JSON.stringify(userToSave));

      return { data: { success: true, data: { user: userToSave } } };
    } catch (error) {
      if (error.response) throw error;
      throw { response: { data: { message: "Pendaftaran gagal." } } };
    }
  },

  logout: async () => {
    try {
      await api.post("/v1/auth/logout");
    } catch (e) {}
    localStorage.removeItem("mid_auth_token");
    localStorage.removeItem("mid_current_user");
    return { success: true };
  },

  getCurrentUser: () => JSON.parse(localStorage.getItem("mid_current_user")),
  isAuthenticated: () => !!localStorage.getItem("mid_auth_token"),
  fetchUser: async () => {
    try {
      const response = await api.get("/v1/auth/me");
      const { user, mosque } = response.data.data;
      const userToSave = {
        ...user,
        isSetupComplete: mosque?.address ? true : false,
        slug: mosque?.slug || user.slug,
      };
      localStorage.setItem("mid_current_user", JSON.stringify(userToSave));
      return { data: { data: userToSave } };
    } catch (error) {
      return {
        data: { data: JSON.parse(localStorage.getItem("mid_current_user")) },
      };
    }
  },
};

export const onboardingService = {
  checkDomain: async (slug) => {
    return await api.post("/v1/onboarding/domain/check", { slug });
  },

  setDomain: async (slug) => {
    const res = await api.post("/v1/onboarding/domain/set", { slug });
    const user = authService.getCurrentUser();
    if (user) {
      user.slug = slug;
      localStorage.setItem("mid_current_user", JSON.stringify(user));
    }
    return res;
  },

  getTemplates: async () => {
    const res = await api.get("/v1/onboarding/templates");
    return { data: { data: res.data.data.templates } };
  },

  selectTemplate: async (templateCode) => {
    return await api.post("/v1/onboarding/template/select", {
      template_code: templateCode,
    });
  },

  updateProfile: async (slug, data) => {
    const res = await api.put(`/v1/mosques/${slug}/profile`, data);
    const user = authService.getCurrentUser();
    if (user) {
      user.isSetupComplete = true;
      localStorage.setItem("mid_current_user", JSON.stringify(user));
    }
    return { data: { success: true, data: res.data.data.mosque } };
  },

  submitVerification: async (data) => {
    return await api.post("/v1/onboarding/verification/submit", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  acceptTerms: async () => {
    return await api.post("/v1/onboarding/terms/accept");
  },
};

export const dashboardService = {
  getProfile: async () => {
    const slug = getSlug();
    if (!slug) return { data: { data: {} } };
    const res = await api.get(`/v1/mosques/${slug}/profile`);
    return { data: { data: res.data.data.mosque } };
  },
  updateProfile: async (data) => {
    return onboardingService.updateProfile(getSlug(), data);
  },
  uploadLogo: async (file) => {
    const fd = new FormData();
    fd.append("logo", file);
    return await api.post(`/v1/mosques/${getSlug()}/documents`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  uploadProfileImage: async (file) => {
    const fd = new FormData();
    fd.append("image", file);
    return await api.post(`/v1/mosques/${getSlug()}/profile-image`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  deleteProfileImage: async () => {
    return await api.delete(`/v1/mosques/${getSlug()}/profile-image`);
  },
  getSiteSettings: async () => {
    const slug = getSlug();
    if (!slug) return {};
    const res = await api.get(`/v1/mosques/${slug}/profile`);
    return res.data?.data?.mosque?.site_settings || {};
  },
  updateSiteSettings: async (settings) => {
    const slug = getSlug();
    const res = await api.put(`/v1/mosques/${slug}/profile`, {
      site_settings: settings,
    });
    return res.data?.data?.mosque || {};
  },
};

export const postService = {
  getPosts: async (type = "") => {
    const slug = getSlug();
    if (!slug) return { data: { data: [] } };
    const params = type ? { type } : {};
    const res = await api.get(`/v1/mosques/${slug}/posts`, { params });
    const rawData = res.data.data.data || [];
    const normalized = rawData.map((p) => ({
      ...p,
      date: p.event_date || p.article_date || p.date,
      time: p.event_time || p.time,
      image: p.cover_image_url || p.image,
      link: p.target_url || p.link,
      is_published: p.status === "published",
    }));
    return { data: { data: normalized } };
  },

  getPost: async (id) => {
    const slug = getSlug();
    const res = await api.get(`/v1/mosques/${slug}/posts/${id}`);
    return { data: { data: res.data.data.post } };
  },

  createPost: async (data) => {
    const slug = getSlug();
    // Use FormData if cover_image is present
    let payload = data;
    let config = {};
    if (data.cover_image instanceof File) {
      payload = new FormData();
      Object.keys(data).forEach((key) => {
        if (data[key] !== null && data[key] !== undefined) {
          // Convert booleans to 1/0 for Laravel FormData compatibility
          const val =
            typeof data[key] === "boolean" ? (data[key] ? 1 : 0) : data[key];
          payload.append(key, val);
        }
      });
      config.headers = { "Content-Type": "multipart/form-data" };
    }
    const res = await api.post(`/v1/mosques/${slug}/posts`, payload, config);
    let p = res.data.data.post;

    // TWO-STEP PUBLISH: Backend requires a separate call to publish
    if (data.is_published === true || data.is_published === "true" || data.is_published === 1) {
      const pubRes = await api.post(`/v1/mosques/${slug}/posts/${p.id}/publish`);
      p = pubRes.data.data.post;
    }

    const normalized = {
      ...p,
      date: p.event_date || p.article_date || p.date,
      time: p.event_time || p.time,
      image: p.cover_image_url || p.image,
      link: p.target_url || p.link,
      is_published: p.status === "published",
    };
    return { data: { success: true, data: normalized } };
  },

  updatePost: async (id, data) => {
    const slug = getSlug();
    let payload = data;
    let config = {};
    let res;
    // In Laravel, multipart PUT requests are handled by sending a POST request with _method=PUT
    if (data.cover_image instanceof File) {
      payload = new FormData();
      Object.keys(data).forEach((key) => {
        if (data[key] !== null && data[key] !== undefined) {
          const val =
            typeof data[key] === "boolean" ? (data[key] ? 1 : 0) : data[key];
          payload.append(key, val);
        }
      });
      payload.append("_method", "PUT");
      config.headers = { "Content-Type": "multipart/form-data" };
      res = await api.post(
        `/v1/mosques/${slug}/posts/${id}`,
        payload,
        config,
      );
    } else {
      res = await api.put(
        `/v1/mosques/${slug}/posts/${id}`,
        payload,
        config,
      );
    }

    let p = res.data?.data?.post;

    // TWO-STEP PUBLISH:
    if (data.is_published === true || data.is_published === "true" || data.is_published === 1) {
      const pubRes = await api.post(`/v1/mosques/${slug}/posts/${id}/publish`);
      p = pubRes.data?.data?.post || p;
    } else if (data.is_published !== undefined) {
      const unpubRes = await api.post(`/v1/mosques/${slug}/posts/${id}/unpublish`);
      p = unpubRes.data?.data?.post || p;
    }

    const normalized = {
      ...p,
      date: p.event_date || p.article_date || p.date,
      time: p.event_time || p.time,
      image: p.cover_image_url || p.image,
      link: p.target_url || p.link,
      is_published: p.status === "published",
    };

    return { data: { success: true, data: normalized } };
  },

  deletePost: async (id) => {
    const slug = getSlug();
    await api.delete(`/v1/mosques/${slug}/posts/${id}`);
    return { data: { success: true } };
  },

  publishPost: async (id) => {
    const slug = getSlug();
    await api.post(`/v1/mosques/${slug}/posts/${id}/publish`);
    return { data: { success: true } };
  },

  unpublishPost: async (id) => {
    const slug = getSlug();
    await api.post(`/v1/mosques/${slug}/posts/${id}/unpublish`);
    return { data: { success: true } };
  },

  addGalleryImages: async (id, formData) => {
    const slug = getSlug();
    const res = await api.post(`/v1/mosques/${slug}/posts/${id}/gallery`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return { data: { success: true, data: res.data.data.post } };
  },

  removeGalleryImage: async (id, imagePath) => {
    const slug = getSlug();
    const res = await api.delete(`/v1/mosques/${slug}/posts/${id}/gallery`, {
      data: { image: imagePath },
    });
    return { data: { success: true, data: res.data.data.post } };
  },
};

export const publicService = {
  getMasjidProfile: async (slug) => {
    const res = await api.get(`/v1/public/${slug}/profile`);
    return { data: { data: res.data.data.mosque } };
  },
  getMasjidPosts: async (slug, type = "") => {
    const params = type ? { type } : {};
    const res = await api.get(`/v1/public/${slug}/posts`, { params });
    return { data: { data: res.data.data.posts.data || [] } };
  },
  getMasjidPostDetail: async (slug, postSlug) => {
    const res = await api.get(`/v1/public/${slug}/posts/${postSlug}`);
    return { data: { data: res.data.data.post } };
  },
};

export const prayerService = {
  getProvinces: async (slug) => {
    const res = await api.get(`/v1/public/${slug}/prayer/provinces`);
    return { data: { data: res.data.data } };
  },
  getCities: async (slug, data) => {
    const res = await api.post(`/v1/public/${slug}/prayer/cities`, data);
    return { data: { data: res.data.data } };
  },
  getSchedule: async (slug, data) => {
    const res = await api.post(`/v1/public/${slug}/prayer/schedule`, data);
    return { data: { data: res.data.data } };
  },
};

// GeoService using Real API with simple in-memory cache
const geoCache = {};

export const geoService = {
  getProvinces: async () => {
    if (geoCache.provinces) return { data: geoCache.provinces };
    const r = await api.get("/v1/regions/provinces");
    geoCache.provinces = r.data.data;
    return { data: r.data.data };
  },
  getRegencies: async (slug, provinceId) => {
    const key = `reg_${provinceId}`;
    if (geoCache[key]) return { data: geoCache[key] };
    const r = await api.get(`/v1/regions/regencies/${provinceId}`);
    geoCache[key] = r.data.data;
    return { data: r.data.data };
  },
  getDistricts: async (slug, regencyId) => {
    const key = `dist_${regencyId}`;
    if (geoCache[key]) return { data: geoCache[key] };
    const r = await api.get(`/v1/regions/districts/${regencyId}`);
    geoCache[key] = r.data.data;
    return { data: r.data.data };
  },
  getVillages: async (slug, districtId) => {
    const key = `vill_${districtId}`;
    if (geoCache[key]) return { data: geoCache[key] };
    const r = await api.get(`/v1/regions/villages/${districtId}`);
    geoCache[key] = r.data.data;
    return { data: r.data.data };
  },
};

// ─── Super Admin Service ───
export const adminService = {
  getDashboard: () => api.get("/v1/admin/dashboard"),
  getVerifications: (params = {}) => api.get("/v1/admin/verifications", { params }),
  getVerificationDetail: (mosqueId) => api.get(`/v1/admin/verifications/${mosqueId}`),
  approveVerification: (mosqueId, data = {}) => api.post(`/v1/admin/verifications/${mosqueId}/approve`, data),
  rejectVerification: (mosqueId, data) => api.post(`/v1/admin/verifications/${mosqueId}/reject`, data),
};

export default {
  authService,
  onboardingService,
  dashboardService,
  postService,
  publicService,
  prayerService,
  geoService,
  adminService,
};
