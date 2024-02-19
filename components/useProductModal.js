
export default {
  template: "#useProductModal",
  props: ["tempProduct"],
  data() {
    return {
      prodouctModal: null,
      qty: 1,
    };
  },
  methods: {
    openModal() {
      this.prodouctModal.show();
    },
    closeModal() {
      this.prodouctModal.hide();
    },
  },
  mounted() {
    this.prodouctModal = new bootstrap.Modal(this.$refs.modal);
  },
};