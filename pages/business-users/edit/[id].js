import { Card, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";

import { Button } from "@/ui";
import { callFetch } from "@/helpers/server";
import { Main } from "@/layouts";

export async function getServerSideProps(context) {
  const [status, users] = await callFetch(
    `/business-users/${context.params.id}`,
    "GET"
  );

  if (!users) {
    return {
      notFound: true,
    };
  }

  return {
    props: { users },
  };
}

export default function Edit({ __state, users }) {
  const router = useRouter();

  const gender = JSON.parse(process.env.NEXT_PUBLIC_USER_GENDER);

  const defaultValues = {
    active: users.active === 1 ? true : false,
    gender: users.gender,
    name: users.name,
    phone: users.phone,
  };
  const onSubmit = async (data) => {
    __state.loading = true;

    try {
      const response = await fetch(`/api/v1/business-users/${users.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const json = await response.json();
      if (response.status === 200) {
        toast.success(`User ${json.name} updated successfully.`);
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
    <Main title={`User: ${users.name} || Edit `} icon="fa-solid fa-users">
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
                {...register("name", {
                  required: true,
                  setValueAs: (value) => value.trim(),
                })}
              />
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
            </Form.Group>

            <Form.Group
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
              }}
            >
              <Form.Label>Gender</Form.Label>
              {gender.map((item, index) => (
                <Form.Check
                  style={{ marginLeft: "10px" }}
                  key={index}
                  type="radio"
                  label={item}
                  value={item}
                  {...register("gender", { required: true })}
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
                Update Business Information
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </Main>
  );
}
