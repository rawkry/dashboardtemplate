import { Card, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import React, { useState } from "react";

import { Button } from "@/ui";
import { callFetch } from "@/helpers/server";
import { Main } from "@/layouts";

export async function getServerSideProps(context) {
  const [status, user] = await callFetch(
    `/business-users/${context.params.id}`,
    "GET"
  );

  if (!user) {
    return {
      notFound: true,
    };
  }

  return {
    props: { user },
  };
}

const BalanceAddDeduct = ({ user: serveruser, __state }) => {
  const router = useRouter();

  const [user, setUser] = useState(serveruser);

  const defaultValues = {
    amount: "",
  };
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues,
  });
  const onSubmit = async (data, value) => {
    try {
      __state.loading = true;
      if (value === "add") {
        const response = await fetch(
          `/api/v1/business-users/${router.query.id}/add-balance`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: parseInt(data.amount),
            }),
          }
        );
        const json = await response.json();
        if (response.status === 200) {
          reset();
          toast.success(
            `Balance Rs ${data.amount} added successfully to ${json.name}.`
          );

          setUser(json);
        } else {
          toast.error(`Error (${response.status}): ${json.message}.`);
        }
      } else if (value === "deduct") {
        const response = await fetch(
          `/api/v1/business-users/${router.query.id}/deduct-balance`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: parseInt(data.amount),
            }),
          }
        );
        const json = await response.json();
        if (response.status === 200) {
          reset();
          toast.success(
            `Balance Rs ${data.amount} deducted successfully from ${json.name}.`
          );

          setUser(json);
        } else {
          toast.error(`Error (${response.status}): ${json.message}.`);
        }
      }
    } catch (err) {
      toast.error(`Error: ${err.message}.`);
    } finally {
      __state.loading = false;
    }
  };
  return (
    <Main
      title={`User: ${user.name} || Balance Add or Deduct `}
      icon="fa-solid fa-money-bills"
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
            <Form.Label>Current Balance</Form.Label>
            <Form.Control
              disabled
              type="text"
              placeholder="Enter Balance"
              value={user.balance}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Balance to Add or Deduct</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter Balance"
              {...register("amount", {
                required: true,
                setValueAs: (value) => value.trim(),
              })}
            />
          </Form.Group>

          <div className="d-flex gap-4 justify-content-end">
            <Button
              className="shadow"
              type="button"
              onClick={() => handleSubmit(onSubmit)("add")}
            >
              Add Balance
            </Button>
            <Button
              className="shadow"
              type="button"
              onClick={() => handleSubmit(onSubmit)("deduct")}
            >
              Deduct Balance
            </Button>
          </div>
        </Form>
      </Card>
    </Main>
  );
};

export default BalanceAddDeduct;
