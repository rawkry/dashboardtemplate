import { Card, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";

import { Button } from "@/ui";
import { callFetch } from "@/helpers/server";
import { Main } from "@/layouts";

export async function getServerSideProps(context) {
  const [status, admins] = await callFetch(
    `/business-admins/${context.params.id}`,
    "GET"
  );

  if (!admins) {
    return {
      notFound: true,
    };
  }

  return {
    props: { admins },
  };
}

export default function Edit({ __state, admins }) {
  const router = useRouter();

  const defaultValues = {
    active: admins.active === 1 ? true : false,
    is_super_admin: admins.is_super_admin === 1 ? true : false,
    email: admins.email,
    name: admins.name,
    phone: admins.phone,
  };
  const onSubmit = async (data) => {
    __state.loading = true;

    try {
      const response = await fetch(`/api/v1/business-admins/${admins.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const json = await response.json();
      if (response.status === 200) {
        toast.success(`Admin ${json.name} updated successfully.`);
      } else {
        toast.error(`Error (${response.status}): ${json.message}.`);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      __state.loading = false;
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues,
  });
  return (
    <Main title={`Admin: ${admins.name} || Edit `} icon="fa-solid fa-users">
      <div>
        <div className="container-fluid pb-3 ">
          <Button
            variant="outline-primary"
            size="md"
            onClick={() => router.back()}
          >
            <i className="fa-solid fa-arrow-left mr-2"></i>Back
          </Button>
        </div>
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
                <span className="text-danger">Name can not be empty</span>
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

            <Form.Group className="mb-3" controlId="Address">
              <Form.Label>Super Admin</Form.Label>
              <Form.Check
                type="checkbox"
                placeholder="Enter super admin"
                {...register("is_super_admin")}
              />
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
