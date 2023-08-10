import { Card, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";

import { Button } from "@/ui";
import { Main } from "@/layouts";
import {
  generateFakeEmail,
  generateFakeNumber,
  generateFakePan,
} from "@/helpers/clients";

export default function Add({ __state }) {
  const onSubmit = async (data) => {
    __state.loading = true;
    let obj = data;
    obj.enrolled = obj.approved === true ? obj.enrolled : false;

    try {
      const response = await fetch(`/api/v1-baa/applicants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(obj),
      });

      const json = await response.json();
      if (response.status === 200) {
        if (json.enrolled === 1) {
          try {
            const fakeBusinessData = {
              name: `${data.business_name} `,
              email: `${generateFakeEmail(data.business_name)}||change`,
              phone: ` ${generateFakeNumber()}||change`,
              address: "lalitpur||change",
              registered_date: `${data.created_at}||change`,
              active: true,
              pan_no: `${generateFakePan()}||change`,
            };
            const response = await fetch(`/api/v1/businesses`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(fakeBusinessData),
            });
            const business = await response.json();
            if (response.status === 200) {
              toast.success(`Business ${business.name} created successfully.`);
              try {
                const fakeAdminData = {
                  name: `${data.name} `,
                  email: data.business_email,
                  phone: `${data.phone} `,
                  active: true,
                  is_super_admin: true,
                  business_id: business.id,
                };
                const response = await fetch(`/api/v1/business-admins`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(fakeAdminData),
                });

                const json = await response.json();
                if (response.status === 200) {
                  toast.success(
                    `Admin ${json.name} added successfully to business ${business.name}.`
                  );
                } else {
                  toast.error(json.message);
                }
              } catch (e) {
                toast.error(e.message);
              }
            } else {
              toast.error(
                `Can not enroll the business ${data.business_name} because ${business.message}`
              );
            }
          } catch (e) {
            toast.error(e.message);
          }
        }
        toast.success(
          `Application for ${json.business_name} submitted successfully.`
        );
        reset();
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
    watch,
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  return (
    <Main title="Applicant || Add " icon="fa-solid fa-users">
      <div>
        <Card className="shadow-sm p-4">
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Personal Name</Form.Label>
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
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Business Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter business name"
                {...register("business_name", {
                  required: true,
                  setValueAs: (value) => value.trim(),
                })}
              />
              {errors.name && (
                <span className="text-danger">Name cannot be empty</span>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="vehicle_number">
              <Form.Label>Business Email</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter business Email"
                {...register("business_email", {
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
              <Form.Label>Approved</Form.Label>
              <Form.Check type="checkbox" {...register("approved")} />
            </Form.Group>

            {watch("approved") && (
              <Form.Group className="mb-3" controlId="Address">
                <Form.Label>Enrolled</Form.Label>
                <Form.Check
                  type="checkbox"
                  placeholder="Enter active"
                  {...register("enrolled", {
                    setValueAs: (value) => {
                      return watch("approved") ? value : false;
                    },
                  })}
                />
              </Form.Group>
            )}
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Remarks</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter remarks"
                {...register("remarks", { required: true })}
              />
              {errors.remarks && (
                <span className="text-danger">Remarks cannot be empty</span>
              )}
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button className="shadow" type="submit">
                Submit Applicant
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </Main>
  );
}
