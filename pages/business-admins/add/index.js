import { Card, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useState } from "react";
import debounce from "debounce";

import { Button } from "@/ui";
import { Main } from "@/layouts";

const roles = JSON.parse(process.env.NEXT_PUBLIC_ROLE);

export default function Add({ __state }) {
  const [businesses, setBusinesses] = useState([]);
  const [business, setBusiness] = useState("");

  const onSubmit = async (data) => {
    const obj = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      active: data.active,
      is_super_admin: data.role === "SuperAdmin" ? true : false,
      business_id: business.id,
    };

    try {
      const response = await fetch(`/api/v1/business-admins`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(obj),
      });

      const json = await response.json();
      if (response.status === 200) {
        toast.success(
          `Admin ${json.name} added successfully to business ${business.name}.`
        );
        reset();
        __state.loading = false;
      } else {
        toast.error(json.message);
      }
    } catch (e) {
      toast.error(e.message);
    }
  };

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  return (
    <Main title="Admin || Add " icon="fa-solid fa-users">
      <div>
        <Card className="shadow-sm p-4">
          <Form className="mb-3" onSubmit={(e) => e.preventDefault()}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Business Name</Form.Label>
              <Form.Control
                required
                style={{
                  position: "relative",
                }}
                type="text"
                autoComplete="off"
                placeholder="Search Business"
                value={business.name}
                onChange={debounce((e) => {
                  setBusiness("");
                  if (e.target.value === "") {
                    setBusinesses([]);
                  } else {
                    fetch(`/api/v1/businesses?name=${e.target.value}`, {
                      method: "GET",
                      headers: {
                        "Content-Type": "application/json",
                      },
                    })
                      .then((res) => res.json())
                      .then((json) => setBusinesses(json.businesses));
                  }
                }, 500)}
              />
              {businesses.length > 0 && (
                <div
                  className="bg-white shadow-sm position-absolute w- text-dark overflow-auto"
                  style={{
                    width: "30%",
                    cursor: "pointer",
                    textTransform: "capitalize",
                    borderRadius: "5px",
                    maxHeight: "50vh",
                    overflowY: "auto",
                  }}
                >
                  {businesses.map((business) => (
                    <div
                      key={business.id}
                      className="p-2 hover-select"
                      style={{
                        width: "auto%",
                      }}
                      onClick={() => {
                        setBusiness(business);
                        setBusinesses([]);
                      }}
                    >
                      {business.name}
                    </div>
                  ))}
                </div>
              )}
            </Form.Group>
          </Form>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                {...register("name", {
                  required: true,
                  setValueAs: (value) => value.trim(),
                })}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="vehicle_number">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Email"
                {...register("email", {
                  required: true,
                  pattern: {
                    value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                    message: "Please enter valid email.",
                  },
                  setValueAs: (value) => value.trim().toLowerCase(),
                })}
              />
              {errors.email && (
                <span className="text-danger">{errors.email.message}</span>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="Address">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter phone number"
                {...register("phone", {
                  required: true,
                  pattern: {
                    value: /^9[678]\d{8}$/,
                    message: "Please enter valid number.",
                  },
                })}
              />
              {errors.phone && (
                <span className="text-danger">{errors.phone.message}</span>
              )}
            </Form.Group>

            <Form.Group
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
              }}
            >
              <Form.Label>Role</Form.Label>
              {roles.map((item, index) => (
                <Form.Check
                  style={{ marginLeft: "10px" }}
                  key={index}
                  type="radio"
                  label={item}
                  value={item}
                  {...register("role", { required: true })}
                />
              ))}
            </Form.Group>

            <Form.Group className="mb-3" controlId="Address">
              <Form.Label>Active</Form.Label>
              <Form.Check
                type="checkbox"
                placeholder="Enter active"
                {...register("active")}
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button className="shadow" type="submit">
                Add admin
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </Main>
  );
}
