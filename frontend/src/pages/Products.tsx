import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  created_at: string;
}

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://127.0.0.1:8000/products"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data: Product[] = await response.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const clearForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setStock("");
    setEditingId(null);
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const url =
        editingId === null
          ? "http://127.0.0.1:8000/products"
          : `http://127.0.0.1:8000/products/${editingId}`;

      const method =
        editingId === null ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description: description || null,
          price: Number(price),
          stock: Number(stock),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            (editingId === null
              ? "Failed to create product"
              : "Failed to update product")
        );
      }

      setSuccess(
        editingId === null
          ? "Product created successfully."
          : "Product updated successfully."
      );

      clearForm();
      await fetchProducts();
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to save product.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setDescription(product.description || "");
    setPrice(String(product.price));
    setStock(String(product.stock));

    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCancelEdit = () => {
    clearForm();
    setError("");
    setSuccess("");
  };

  const handleDelete = async (productId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await fetch(
        `http://127.0.0.1:8000/products/${productId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to delete product"
        );
      }

      if (editingId === productId) {
        clearForm();
      }

      setSuccess("Product deleted successfully.");

      await fetchProducts();
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to delete product.");
      }
    }
  };

  const totalProducts = products.length;

  const totalStock = products.reduce(
    (total, product) => total + product.stock,
    0
  );

  const inventoryValue = products.reduce(
    (total, product) =>
      total + product.price * product.stock,
    0
  );

  const lowStockProducts = products.filter(
    (product) =>
      product.stock > 0 && product.stock <= 5
  ).length;

  const outOfStockProducts = products.filter(
    (product) => product.stock === 0
  ).length;

  const formatCurrency = (value: number) =>
    `$${value.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;

  return (
    <main className="main-content">
      <header className="products-topbar">
        <div>
          <h1>Products</h1>
          <p>
            Manage your products, pricing, and inventory.
          </p>
        </div>

        <button
          type="button"
          className="products-add-button"
          onClick={() => {
            clearForm();
            setError("");
            setSuccess("");
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }}
        >
          + Add Product
        </button>
      </header>

      <section className="product-stat-grid">
        <div className="product-stat-card">
          <span>Total Products</span>
          <strong>{totalProducts}</strong>
          <small>Products in catalog</small>
        </div>

        <div className="product-stat-card">
          <span>Total Stock</span>
          <strong>{totalStock}</strong>
          <small>Units available</small>
        </div>

        <div className="product-stat-card">
          <span>Inventory Value</span>
          <strong>
            {formatCurrency(inventoryValue)}
          </strong>
          <small>Current stock value</small>
        </div>

        <div className="product-stat-card">
          <span>Low Stock</span>
          <strong>{lowStockProducts}</strong>
          <small>
            {outOfStockProducts} out of stock
          </small>
        </div>
      </section>

      <section className="product-form-card">
        <div className="product-section-heading">
          <div>
            <h2>
              {editingId === null
                ? "Add Product"
                : "Edit Product"}
            </h2>

            <p>
              {editingId === null
                ? "Add a new product to your catalog."
                : "Update the selected product."}
            </p>
          </div>
        </div>

        <form
          className="product-form"
          onSubmit={handleSubmit}
        >
          <div className="product-field">
            <label htmlFor="product-name">
              Product Name
            </label>

            <input
              id="product-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Product name"
              required
            />
          </div>

          <div className="product-field product-field-wide">
            <label htmlFor="product-description">
              Description
            </label>

            <input
              id="product-description"
              type="text"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Product description"
            />
          </div>

          <div className="product-field">
            <label htmlFor="product-price">
              Price
            </label>

            <input
              id="product-price"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) =>
                setPrice(event.target.value)
              }
              placeholder="75000"
              required
            />
          </div>

          <div className="product-field">
            <label htmlFor="product-stock">
              Stock
            </label>

            <input
              id="product-stock"
              type="number"
              min="0"
              value={stock}
              onChange={(event) =>
                setStock(event.target.value)
              }
              placeholder="10"
              required
            />
          </div>

          <div className="product-form-actions">
            <button
              type="submit"
              className="product-save-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId === null
                  ? "Add Product"
                  : "Save Changes"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                className="product-cancel-button"
                onClick={handleCancelEdit}
                disabled={saving}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {success && (
          <div className="product-success">
            {success}
          </div>
        )}

        {error && (
          <div className="product-error">
            {error}
          </div>
        )}
      </section>

      <section className="product-list-card">
        <div className="product-section-heading">
          <div>
            <h2>Product Catalog</h2>
            <p>
              View and manage all products.
            </p>
          </div>

          <span className="product-count">
            {totalProducts} products
          </span>
        </div>

        {loading && (
          <div className="product-loading">
            Loading products...
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="product-empty">
            <strong>No products found</strong>
            <span>
              Add your first product using the form above.
            </span>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="product-table-container">
            <table className="product-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Product</th>
                  <th>Description</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => {
                  let stockClass =
                    "stock-normal";

                  if (product.stock === 0) {
                    stockClass = "stock-empty";
                  } else if (product.stock <= 5) {
                    stockClass = "stock-low";
                  }

                  return (
                    <tr key={product.id}>
                      <td>
                        <span className="product-id">
                          #{product.id}
                        </span>
                      </td>

                      <td>
                        <div className="product-name-cell">
                          <strong>
                            {product.name}
                          </strong>
                        </div>
                      </td>

                      <td>
                        <span className="product-description-cell">
                          {product.description || "-"}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {formatCurrency(product.price)}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`stock-badge ${stockClass}`}
                        >
                          {product.stock}
                        </span>
                      </td>

                      <td>
                        {new Date(
                          product.created_at
                        ).toLocaleDateString()}
                      </td>

                      <td>
                        <div className="product-actions">
                          <button
                            type="button"
                            className="product-edit-button"
                            onClick={() =>
                              handleEdit(product)
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="product-delete-button"
                            onClick={() =>
                              handleDelete(product.id)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default Products;