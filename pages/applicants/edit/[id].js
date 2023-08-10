import { Card, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";

import { Button } from "@/ui";
import { callFetchApplicants } from "@/helpers/server";
import { Main } from "@/layouts";

export async function getServerSideProps(context) {
  const [status, business] = await callFetchApplicants(
    `/applicants/${context.params.id}`,
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

  const defaultValues = {
    enrolled: serverBusiness.enrolled === 1 ? true : false,
    approved: serverBusiness.approved === 1 ? true : false,
    business_email: serverBusiness.business_email,
    name: serverBusiness.name,
    business_name: serverBusiness.business_name,
    phone: serverBusiness.phone,
    remarks: serverBusiness.remarks ? serverBusiness.remarks : "",
  };

  const onSubmit = async (data) => {
    try {
      __state.loading = true;

      const response = await fetch(
        `/api/v1-baa/applicants/${serverBusiness.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (response.status === 200) {
        toast.success("Application updated successfully");
      } else {
        toast.error(`Error (${response.status}): ${json.message}.`);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      __state.loading = false;
    }
  };

  const {
    watch,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues,
  });
  return (
    <Main
      title={`Applicant: ${serverBusiness.business_name} || Edit `}
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
              {errors.phone && (
                <span className="text-danger">Provide valid phone number</span>
              )}
            </Form.Group>
            <Form.Group className="mb-3" controlId="business_name">
              <Form.Label>Business Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter business name"
                {...register("business_name", {
                  required: true,
                  setValueAs: (value) => value.trim(),
                })}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="business_email">
              <Form.Label>Business Email</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Business Email"
                {...register("business_email", {
                  required: true,
                  pattern: {
                    value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                    message: "Please enter valid email.",
                  },
                  setValueAs: (value) => value.trim().toLowerCase(),
                })}
              />
              {errors.business_email && (
                <span className="text-danger">Provide valid email</span>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="remarks">
              <Form.Label>Remarks</Form.Label>
              <Form.Control
                type="text"
                {...register("remarks", {
                  required: true,

                  setValueAs: (value) => value.trim(),
                })}
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button className="shadow" type="submit">
                Update Application
              </Button>
            </div>
          </Form>
        </Card>
      </div>
    </Main>
  );
}
