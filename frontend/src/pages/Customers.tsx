import { useEffect, useState } from "react";
import type { FormEvent } from "react";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  created_at: string;
}

function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://127.0.0.1:8000/customers"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }

      const data: Customer[] = await response.json();

      setCustomers(data);
    } catch (error) {
      console.error(error);
      setError("Unable to load customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        "http://127.0.0.1:8000/customers",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name,
            email: email,
            phone: phone || null,
            company: company || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to create customer"
        );
      }

      setSuccess("Customer created successfully.");

      setName("");
      setEmail("");
      setPhone("");
      setCompany("");

      await fetchCustomers();
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to create customer.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="main-content">
      <header className="customers-topbar">
        <div>
          <h1>Customers</h1>

          <p>
            Manage your business customers and contact information.
          </p>
        </div>

        <div className="customer-total">
          <strong>{customers.length}</strong>
          <span>Total Customers</span>
        </div>
      </header>

      <section className="customer-form-card">
        <div className="customer-section-heading">
          <div>
            <h2>Add Customer</h2>

            <p>
              Add a new customer to your business database.
            </p>
          </div>
        </div>

        <form
          className="customer-form"
          onSubmit={handleSubmit}
        >
          <div className="customer-field">
            <label htmlFor="customer-name">
              Name
            </label>

            <input
              id="customer-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Customer name"
              required
            />
          </div>

          <div className="customer-field">
            <label htmlFor="customer-email">
              Email
            </label>

            <input
              id="customer-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="customer@example.com"
              required
            />
          </div>

          <div className="customer-field">
            <label htmlFor="customer-phone">
              Phone
            </label>

            <input
              id="customer-phone"
              type="text"
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value)
              }
              placeholder="9876543210"
            />
          </div>

          <div className="customer-field">
            <label htmlFor="customer-company">
              Company
            </label>

            <input
              id="customer-company"
              type="text"
              value={company}
              onChange={(event) =>
                setCompany(event.target.value)
              }
              placeholder="Company name"
            />
          </div>

          <div className="customer-form-actions">
            <button
              type="submit"
              className="customer-save-button"
              disabled={saving}
            >
              {saving ? "Saving..." : "Add Customer"}
            </button>
          </div>
        </form>

        {success && (
          <div className="customer-success">
            {success}
          </div>
        )}

        {error && (
          <div className="customer-error">
            {error}
          </div>
        )}
      </section>

      <section className="customer-list-card">
        <div className="customer-section-heading">
          <div>
            <h2>Customer List</h2>

            <p>
              View all customers registered in your business.
            </p>
          </div>

          <span className="customer-count">
            {customers.length} customers
          </span>
        </div>

        {loading && (
          <div className="customer-loading">
            Loading customers...
          </div>
        )}

        {!loading &&
          !error &&
          customers.length === 0 && (
            <div className="customer-empty">
              <strong>No customers found</strong>

              <span>
                Add your first customer using the form above.
              </span>
            </div>
          )}

        {!loading &&
          !error &&
          customers.length > 0 && (
            <div className="customer-table-container">
              <table className="customer-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Company</th>
                    <th>Created</th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td>
                        <span className="customer-id">
                          #{customer.id}
                        </span>
                      </td>

                      <td>
                        <div className="customer-name-cell">
                          <strong>
                            {customer.name}
                          </strong>
                        </div>
                      </td>

                      <td>
                        <span className="customer-email-cell">
                          {customer.email}
                        </span>
                      </td>

                      <td>
                        {customer.phone || "-"}
                      </td>

                      <td>
                        {customer.company || "-"}
                      </td>

                      <td>
                        {new Date(
                          customer.created_at
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </section>
    </main>
  );
}

export default Customers;