import { Card, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import React, { useState } from "react";

import { Button } from "@/ui";
import { callFetch } from "@/helpers/server";
import { Main } from "@/layouts";

export async function getServerSideProps(context) {
  const [status, businessCashflow] = await callFetch(
    `/business-cashflows/${context.params.id}`,
    "GET"
  );

  if (!businessCashflow) {
    return {
      notFound: true,
    };
  }

  return {
    props: { businessCashflow },
  };
}

const Settings = ({ businessCashflow: serverbusinessCashflow }) => {
  const internalbusinessCashflowBaseService = JSON.parse(
    process.env.NEXT_PUBLIC_BUSINESS_INTERNAL_BASE_SERVICE
  );

  const router = useRouter();

  const [businessCashflow, setbusinessCashflow] = useState(
    serverbusinessCashflow
  );

  const defaultValues = {
    remark: businessCashflow.remark,
  };
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues,
  });

  const onSubmit = async (data, e) => {
    try {
      const response = await fetch(
        `/api/v1/business-cashflows/${router.query.id}/update-remark`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...internalbusinessCashflowBaseService.headers,
          },
          body: JSON.stringify(data),
        }
      );
      const json = await response.json();
      if (response.status === 200) {
        toast.success("Remark Updated successfully.");
      } else {
        toast.error(`Error (${response.status}): ${json.message}.`);
      }
    } catch (err) {
      toast.error(`Error: ${err.message}.`);
    }
  };
  return (
    <Main
      title={`
     Remark for ${businessCashflow.type}
    `}
      icon="fa-solid fa-gear"
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
            <Form.Label>Update Remark</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter remark"
              {...register("remark", { required: true })}
            />
          </Form.Group>

          <div className="d-flex gap-4 justify-content-end">
            <Button className="shadow" type="submit" name="add" value="add">
              Update Remark
            </Button>
          </div>
        </Form>
      </Card>
    </Main>
  );
};

export default Settings;
