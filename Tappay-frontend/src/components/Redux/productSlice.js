import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../utils/axiosInstance";

export const fetchProductsInStoreThunk = createAsyncThunk(
  "products/fetchProductsInStore",
  async (storeId) => {
    const response = await axiosInstance.get(
      `/products/products-in-store?storeId=${storeId}`
    );
    return response.data;
  }
);

export const fetchProductsAcrossStoresThunk = createAsyncThunk(
  "products/fetchProductsAcrossStores",
  async () => {
    const response = await axiosInstance.get(
      "/products/products-across-stores"
    );
    return response.data;
  }
);

export const fetchProductsDetailsThunk = createAsyncThunk(
  "products/fetchProducts",
  async () => {
    const response = await axiosInstance.get(`/products/products-details`);
    return response.data;
  }
);

export const fetchCategoriesThunk = createAsyncThunk(
  "products/fetchCategories",
  async () => {
    const response = await axiosInstance.get("/categories");
    return response.data;
  }
);

export const addCategoryThunk = createAsyncThunk(
  "products/addCategory",
  async (category) => {
    console.log("category", category);
    const response = await axiosInstance.post("/categories", category);
    return response.data;
  }
);

export const updateCategoryThunk = createAsyncThunk(
  "products/updateCategory",
  async (category) => {
    const response = await axiosInstance.put(
      `/categories/${category.id}`,
      category
    );
    return response.data;
  }
);

export const deleteCategoryThunk = createAsyncThunk(
  "products/deleteCategory",
  async (categoryId) => {
    const response = await axiosInstance.delete(`/categories/${categoryId}`);
    return response.data;
  }
);

export const addProductThunk = createAsyncThunk(
  "products/addProduct",
  async (product) => {
    const response = await axiosInstance.post("/products", product, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }
);

export const saveProductDetailsThunk = createAsyncThunk(
  "products/saveProductDetails",
  async (productDetails) => {
    console.log("save product details", productDetails);
    const response = await axiosInstance.post(
      "/products/save-product-details",
      productDetails,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    console.log("response in slice: ", response);
    return response.data;
  }
);

export const saveProductStoreThunk = createAsyncThunk(
  "products/saveProductStore",
  async (productStore) => {
    console.log("productStore in slice: ", productStore);
    const response = await axiosInstance.post("/products/save-product-store", productStore);
    console.log("response in slice: ", response);
    return response.data;
  }
);

export const saveProductThunk = createAsyncThunk(
  "products/saveProduct",
  async (product) => {
    // const response = await axiosInstance.post("/products", product, {
    //   headers: { "Content-Type": "multipart/form-data" },
    // });
    return "success";
  }
);

export const deleteProductThunk = createAsyncThunk(
  "products/deleteProduct",
  async (productId) => {
    const response = await axiosInstance.delete(`/products/${productId}`);
    return response.data;
  }
);

const initialState = {
  productsInStore: [],
  productsAcrossStores: [],
  productsList: [],
  selectedProduct: null,
  categoriesList: [],
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    // filterProducts: (state, action) => {
    //   const { searchTerm, sortOption } = action.payload;
    //   state.filteredList = state.productsList.filter((product) =>
    //     product.name.toLowerCase().includes(searchTerm.toLowerCase())
    //   );

    //   if (sortOption === "sellingPriceAsc") {
    //     state.filteredList.sort((a, b) => a.sellingPrice - b.sellingPrice);
    //   } else if (sortOption === "sellingPriceDesc") {
    //     state.filteredList.sort((a, b) => b.sellingPrice - a.sellingPrice);
    //   }
    // },
    selectProduct: (state, action) => {
      state.selectedProduct = state.productsList.find(
        (product) => product.id === action.payload
      );
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsDetailsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductsDetailsThunk.fulfilled, (state, action) => {
        state.productsList = action.payload;
        state.loading = false;
      })
      .addCase(fetchProductsDetailsThunk.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })
      .addCase(fetchProductsInStoreThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductsInStoreThunk.fulfilled, (state, action) => {
        state.productsInStore = action.payload;
        state.loading = false;
      })
      .addCase(fetchProductsInStoreThunk.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })
      .addCase(fetchProductsAcrossStoresThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductsAcrossStoresThunk.fulfilled, (state, action) => {
        state.productsAcrossStores = action.payload;
        state.loading = false;
      })
      .addCase(fetchProductsAcrossStoresThunk.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })
      .addCase(fetchCategoriesThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCategoriesThunk.fulfilled, (state, action) => {
        state.categoriesList = action.payload;
      })
      .addCase(fetchCategoriesThunk.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })
      .addCase(addCategoryThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(addCategoryThunk.fulfilled, (state, action) => {
        state.categoriesList.push(action.payload);
        state.loading = false;
      })
      .addCase(addCategoryThunk.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })
      .addCase(updateCategoryThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCategoryThunk.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(updateCategoryThunk.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })
      .addCase(deleteCategoryThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCategoryThunk.fulfilled, (state, action) => {
        state.categoriesList = state.categoriesList.filter(
          (category) => category.id !== action.payload.id
        );
        state.loading = false;
      })
      .addCase(deleteCategoryThunk.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })
      .addCase(addProductThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(addProductThunk.fulfilled, (state, action) => {
        state.productsList.push(action.payload);
        state.loading = false;
      })
      .addCase(addProductThunk.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })
      .addCase(saveProductDetailsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(saveProductDetailsThunk.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(saveProductDetailsThunk.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })
      .addCase(saveProductStoreThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(saveProductStoreThunk.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(saveProductStoreThunk.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })
      .addCase(deleteProductThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProductThunk.fulfilled, (state, action) => {
        state.productsList = state.productsList.filter(
          (product) => product.id !== action.payload.id
        );
        state.loading = false;
      })
      .addCase(deleteProductThunk.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      });
  },
});

export const { selectProduct, clearSelectedProduct } = productSlice.actions;

export const selectProductById = (state, productId) => {
  return state.products.productsInStore.find(
    (product) => product.id === productId
  );
};

export const selectProductDetailsById = (state, productId) => {
  return state.products.productsAcrossStores.find(
    (product) => product.productDetails.id === productId
  );
};

export const selectCategoryById = (state, categoryId) => {
  return state.products.categoriesList.find(
    (category) => category.id === categoryId
  );
};

export default productSlice.reducer;
