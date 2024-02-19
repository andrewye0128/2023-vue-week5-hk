// import 元件
import useProductModal from "./components/useProductModal.js";

//共用變數
const apiUrl = "https://vue3-course-api.hexschool.io/v2";
const apiPath = "hao-ye";

// 表單驗證
Object.keys(VeeValidateRules).forEach((rule) => {
  if (rule !== "default") {
    VeeValidate.defineRule(rule, VeeValidateRules[rule]);
  }
});

// 讀取外部的資源
VeeValidateI18n.loadLocaleFromURL("./zh_TW.json");

// Activate the locale
VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize("zh_TW"),
  validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
});

const app = Vue.createApp({
  data() {
    return {
      isLoading: false,
      loadingStatus: "",
      products: [],
      tempProduct: {},
      cart: {},
      form: {
        user: {
          name: '',
          email: '',
          tel: '',
          address: '',
        },
        message: '',
      }
    };
  },
  methods: {
    // 取得商品列表
    async getProducts() {
      const url = `${apiUrl}/api/${apiPath}/products`;

      try {
        const res = await axios.get(url);
        this.products = res.data.products;
      } catch (err) {
        console.log(err);
      }
    },
    // 取得個別商品更多資訊
    async getProduct(id) {
      const url = `${apiUrl}/api/${apiPath}/product/${id}`;
      this.loadingStatus = id;

      try {
        const res = await axios.get(url);
        this.tempProduct = res.data.product;
        this.loadingStatus = "";
        this.$refs.useProductModal.openModal();
      } catch (err) {
        console.log(err);
      }
    },
    // 取得購物車商品列表
    async getCart() {
      const url = `${apiUrl}/api/${apiPath}/cart`;

      try {
        const res = await axios.get(url);
        this.cart = res.data.data;
      } catch (err) {
        console.log(err);
        this.alertError(err.response.data.message);
      }
    },
    // 加入購物車函式
    async addCart(id, qty = 1) {
      const url = `${apiUrl}/api/${apiPath}/cart`;
      this.loadingStatus = id;
      const cart = {
        product_id: id,
        qty,
      };

      this.$refs.useProductModal.closeModal();
      try {
        const res = await axios.post(url, { data: cart });
        this.loadingStatus = "";
        const addCartMsg = res.data.message;
        this.alertSuccess(addCartMsg);
        this.getCart();
      } catch {
        console.log(err);
        this.alertError(err.response.data.message);
      }
    },
    // 更新購物車數量
    async updateCart(data) {
      this.loadingStatus = data.id;

      // this.isLoading => true;
      this.toggleLoading();

      const url = `${apiUrl}/api/${apiPath}/cart/${data.id}`;
      const cart = {
        product_id: data.product_id,
        qty: data.qty,
      };

      try {
        const res = await axios.put(url, { data: cart });
        this.loadingStatus = "";
        const updateCartMsg = res.data.message;

        // this.isLoading => false;
        this.toggleLoading();
        this.alertSuccess(updateCartMsg);
        this.getCart();
      } catch (err) {
        console.log(err);
        this.alertError(err.response.data.message);
      }
    },
    // 移除購物車
    async removeCartItem(id) {
      const url = `${apiUrl}/api/${apiPath}/cart/${id}`;
      this.loadingStatus = id;

      try {
        const res = await axios.delete(url);
        const removeMsg = res.data.message;
        this.loadingStatus = "";
        this.alertSuccess(removeMsg);
        this.getCart();

      } catch (err) {
        console.log(err);
        this.alertError(err.response.data.message);
      }
    },
    // 移出全部的購物車商品
    async deleteAllCarts() {
      Swal.fire({
        title: "確認是否要刪除購物車所有商品?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "確定",

      }).then((result) => {
        if (result.isConfirmed) {
          // this.isLoading => true;
          this.toggleLoading();

          const url = `${apiUrl}/api/${apiPath}/carts`;

          axios
            .delete(url)
            .then((res) => {
              // this.isLoading => false;
              this.toggleLoading();
              this.alertSuccess(res.data.message);
              this.getCart();
            })
            .catch((err) => this.alertError(err.response.data.message));
        }
      });
    },
    // 送出表單
    async SubmitOrder() {
      const url = `${apiUrl}/api/${apiPath}/order`;
      const order = this.form

      try {
        const res = await axios.post(url, { data: order });
        const submitOrderMsg = res.data.message;
        this.alertSuccess(submitOrderMsg);
        this.$refs.form.resetForm()
        this.getCart();

      } catch (err) {
        console.log(err)
        this.alertError(err.response.data.message);
      }
    },
    toggleLoading() {
      this.isLoading = !this.isLoading;
    },
    alertSuccess(msg) {
      Swal.fire({
        position: "center",
        icon: "success",
        title: msg,
        showConfirmButton: false,
        timer: 1500,
      });
    },
    alertError(msg) {
      Swal.fire({
        title: msg,
        icon: "error",
      });
    },
  },
  mounted() {
    this.getProducts();
    this.getCart();
  },
});

app.component("loading", VueLoading.Component);
app.component("useProductModal", useProductModal);
app.component("VForm", VeeValidate.Form);
app.component("VField", VeeValidate.Field);
app.component("ErrorMessage", VeeValidate.ErrorMessage);

app.mount("#app");
