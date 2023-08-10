import { Card, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";

import { Button } from "@/ui";
import { callFetch } from "@/helpers/server";
import { Main } from "@/layouts";
import { useState } from "react";

export async function getServerSideProps(context) {
  const [status, business] = await callFetch(
    `/businesses/${context.params.id}`,
    "GET"
  );

  if (!business) {
    return {
      notFound: true,
    };
  }

  return {
    props: { business },
  };
}

export default function Edit({ __state, business: serverBusiness }) {
  const router = useRouter();
  const [business, setBusiness] = useState(serverBusiness);

  const defaultValues = {
    active: serverBusiness.active === 1 ? true : false,
    is_live: serverBusiness.is_live === 1 ? true : false,
    address: serverBusiness.address.split("||")[0],
    email: serverBusiness.email.split("||")[0],
    name: serverBusiness.name,
    pan_no: serverBusiness.pan_no.split("||")[0],
    phone: serverBusiness.phone.split("||")[0],
    registered_date: serverBusiness.registered_date.split("||")[0],
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues,
  });

  const registerTrimmed = (name, options) => {
    if (name === "email") {
      return register(name, {
        ...options,
        setValueAs: (value) => value.trim().toLowerCase(),
      });
    } else {
      return register(name, {
        ...options,
        setValueAs: (value) => value.trim(),
      });
    }
  };

  const onSubmit = async (data) => {
    try {
      __state.loading = true;

      const response = await fetch(`/api/v1/businesses/${serverBusiness.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const json = await response.json();
      if (response.status === 200) {
        toast.success("Business updated successfully");
        setBusiness(json);
      } else {
        toast.error(`Error (${response.status}): ${json.message}.`);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      __state.loading = false;
    }
  };

  return (
    <Main
      title={`Business: ${business.name} || Edit `}
      icon="fa-solid fa-users"
    >
      <div className="container-fluid pb-3 ">
        <Button
          variant="outline-primary"
          size="md"
          onClick={() => router.back()}
        >
          <i className="fa-solid fa-arrow-left mr-2"></i>Back
        </Button>
      </div>
      <div>
        <Card className="shadow-sm p-4">
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter name"
                {...registerTrimmed("name", { required: true })}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="vehicle_number">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Email"
                {...registerTrimmed("email", {
                  required: true,

                  pattern:
                    /^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/gm,
                })}
              />
              <div>
                {errors.email && (
                  <div className="text-danger">Provide valid email</div>
                )}
                {business.email.split("||")[1] === "change" && (
                  <div className="text-danger">Need to change this email</div>
                )}
              </div>
            </Form.Group>

            <Form.Group className="mb-3" controlId="Address">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter phone number"
                {...registerTrimmed("phone", {
                  required: true,
                  pattern: /^9[678]\d{8}$/,
                })}
              />
              <div>
                {errors.phone && (
                  <div className="text-danger">Provide valid phone number</div>
                )}
                {business.phone.split("||")[1] === "change" && (
                  <div className="text-danger ">
                    Need to change this phone number
                  </div>
                )}
              </div>
            </Form.Group>
            <Form.Group className="mb-3" controlId="Address">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter address"
                {...registerTrimmed("address", { required: true })}
              />
              {business.address.split("||")[1] === "change" && (
                <span className="text-danger">Need to change this address</span>
              )}
            </Form.Group>
            <Form.Group className="mb-3" controlId="Address">
              <Form.Label>PAN number</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter PAN number"
                {...registerTrimmed("pan_no", {
                  required: true,
                  maxLength: 9,
                  minLength: 9,
                  required: "This field is required.",
                })}
              />
              <div>
                {errors.pan_no && (
                  <div className="text-danger">Provide valid PAN number</div>
                )}
                {business.pan_no.split("||")[1] === "change" && (
                  <div className="text-danger">
                    Need to change this PAN number
                  </div>
                )}
              </div>
            </Form.Group>
            <Form.Group className="mb-3" controlId="Address">
              <Form.Label>Registered Date</Form.Label>

              <Form.Control
                type="date"
                placeholder="Registered Date"
                {...register("registered_date", { required: true })}
                max={new Date().toISOString().split("T")[0]}
              />
              {business.registered_date.split("||")[1] === "change" && (
                <span className="text-danger">
                  Need to change the registeration date
                </span>
              )}
            </Form.Group>
            <Form.Group className="mb-3" controlId="Address">
              <Form.Label>Live</Form.Label>
              <Form.Check type="checkbox" {...register("is_live")} />
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
                Update Business Information
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </Main>
  );
}
