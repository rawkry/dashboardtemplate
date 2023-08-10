import { Card, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";

import { Button } from "@/ui";
import { Main } from "@/layouts";

export default function Add({ __state }) {
  const onSubmit = async (data) => {
    const businesswithoutdoc = {
      name: data.name,
      email: data.email,
      active: data.active,
      is_live: data.is_live,
      phone: data.phone,
      address: data.address,
      pan_no: data.pan_no,
      registered_date: data.registered_date,
    };
    try {
      const response = await fetch(`/api/v1/businesses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(businesswithoutdoc),
      });

      const json = await response.json();
      if (response.status === 200) {
        const panformData = new FormData();
        const cRegformData = new FormData();
        panformData.append("image", data.pan_image[0]);
        cRegformData.append("image", data.company_registration_image[0]);
        try {
          await fetch(`/api/v1/businesses/upload/${json.id}/pan`, {
            method: "PATCH",
            body: panformData,
          });
          await fetch(`/api/v1/businesses/upload/${json.id}/registration`, {
            method: "PATCH",
            body: cRegformData,
          });
          toast.success(`Business ${json.name} created successfully.`);
          reset();
        } catch (err) {
          toast.error("something went wrong please try agian later...");
        }
      } else {
        toast.error(json.message);
      }
    } catch (e) {
      toast.error(e.message);
    } finally {
      __state.loading = false;
    }
  };

  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  return (
    <Main title="Business || Add " icon="fa-solid fa-users">
      <div>
        <Card className="shadow-sm p-4">
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
              {errors.name && (
                <span className="text-danger">Name cannot be empty</span>
              )}
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
                <span className="text-danger">Provide valid email</span>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="Address">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter phone number"
                {...register("phone", {
                  required: true,
                  pattern: /^9[678]\d{8}$/,
                })}
              />
              {errors.phone && (
                <span className="text-danger">Provide valid phone number</span>
              )}
            </Form.Group>
            <Form.Group className="mb-3" controlId="Address">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter address"
                {...register("address", {
                  required: true,
                  setValueAs: (value) => value.trim(),
                })}
              />
              {errors.address && (
                <span className="text-danger">Provide valid address</span>
              )}
            </Form.Group>
            <Form.Group className="mb-3" controlId="Address">
              <Form.Label>PAN number</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter PAN number"
                {...register("pan_no", {
                  minLength: 9,
                  maxLength: 9,
                  required: true,
                  setValueAs: (value) => value.trim(),
                })}
              />
              {errors.pan_no && (
                <span className="text-danger">Provide valid PAN number</span>
              )}
            </Form.Group>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>PAN image</Form.Label>
              <Form.Control
                name="pan_image"
                required
                type="file"
                {...register("pan_image")}
                accept="image/*"
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Registration image</Form.Label>

              <Form.Control
                required
                name="company_registration_image"
                type="file"
                {...register("company_registration_image")}
                accept="image/*"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Registered Date</Form.Label>
              <Form.Control
                type="date"
                placeholder="Registered Date"
                {...register("registered_date", { required: true })}
                max={new Date().toISOString().split("T")[0]}
              />
              {errors.registered_date && (
                <span className="text-danger">Provide valid date</span>
              )}
            </Form.Group>
            <Form.Group className="mb-3" controlId="Address">
              <Form.Label>Active</Form.Label>
              <Form.Check
                type="checkbox"
                placeholder="Enter active"
                {...register("active")}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="Address">
              <Form.Label>Live</Form.Label>
              <Form.Check
                type="checkbox"
                placeholder="Enter active"
                {...register("is_live")}
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button className="shadow" type="submit">
                Add Business
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </Main>
  );
}
