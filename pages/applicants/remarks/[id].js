import { Card, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import React, { useState } from "react";

import { Button } from "@/ui";
import { callFetchApplicants } from "@/helpers/server";
import { Main } from "@/layouts";

export async function getServerSideProps(context) {
  const [status, applicants] = await callFetchApplicants(
    `/applicants/${context.params.id}`,
    "GET"
  );

  if (!applicants) {
    return {
      notFound: true,
    };
  }

  return {
    props: { applicants },
  };
}

const UpdateRemarks = ({ applicants: serverapplicants }) => {
  const router = useRouter();

  const [applicants, setApplicants] = useState(serverapplicants);

  const defaultValues = {
    remarks: applicants.remarks ? applicants.remarks : "",
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues,
  });
  const onSubmit = async (data) => {
    try {
      const response = await fetch(
        `/api/v1-baa/applicants/${router.query.id}/change-remarks`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      const json = await response.json();
      if (response.status === 200) {
        toast.success(
          `Successfully updated remarks for ${applicants.business_name}`
        );
      } else {
        toast.error(`Error (${response.status}): ${json.message}.`);
      }
    } catch (err) {
      toast.error(`Error: ${err.message}.`);
    }
  };
  return (
    <Main
      title={`Applicants: ${applicants.business_name} || Update remarks `}
      icon="fas fa-pen-to-square me-1"
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
      <Card className="shadow-sm p-4">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Update Remarks</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter remarks"
              {...register("remarks", {
                required: true,
                setValueAs: (value) => value.trim(),
              })}
            />
          </Form.Group>

          <div className="d-flex gap-4 justify-content-end">
            <Button className="shadow" type="submit">
              Update Remarks
            </Button>
          </div>
        </Form>
      </Card>
    </Main>
  );
};

export default UpdateRemarks;
