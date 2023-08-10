import { Card, Form } from "react-bootstrap";
import { Main } from "@/layouts";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import React, { useState } from "react";

import { Button } from "@/ui";
import { callFetch } from "@/helpers/server";

export async function getServerSideProps(context) {
  const [status, business_admins] = await callFetch(
    `/business-admins/${context.params.id}`,
    "GET"
  );

  if (!business_admins) {
    return {
      notFound: true,
    };
  }

  return {
    props: { business_admins },
  };
}

const Settings = ({ business_admins: serverbusiness_admins }) => {
  const router = useRouter();

  const [business_admins, setbusiness_admins] = useState(serverbusiness_admins);

  const defaultValues = {
    password: "",
  };
  const {
    reset,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: defaultValues,
  });

  const handleTokenRegenerate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `/api/v1/business-admins/${router.query.id}/regenerate-token`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const json = await response.json();
      if (response.status === 200) {
        toast.success("Token Regenerated successfully.");
      } else {
        toast.error(`Error (${response.status}): ${json.message}.`);
      }
    } catch (err) {
      toast.error(`Error: ${err.message}.`);
    }
  };

  const onSubmit = async (data) => {
    try {
      const response = await fetch(
        `/api/v1/business-admins/${router.query.id}/update-password`,
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
        toast.success("Password Updated successfully.");
        reset();
      } else {
        toast.error(`Error (${response.status}): ${json.message}.`);
      }
    } catch (err) {
      toast.error(`Error: ${err.message}.`);
    }
  };
  return (
    <Main
      title={`Admin: ${business_admins.name} || Settings  `}
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
            <Form.Label>Update Password</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Password"
              {...register("password", {
                required: true,
                minLength: 8,
                maxLength: 20,
                setValueAs: (value) => value.trim(),
              })}
            />
            {errors.password && (
              <Form.Text className="text-danger">
                {errors.password.type === "required" && "Password is required"}
                {errors.password.type === "minLength" &&
                  "Password must be at least 8 characters"}
                {errors.password.type === "maxLength" &&
                  "Password must be at most 20 characters"}
              </Form.Text>
            )}
          </Form.Group>

          <div className="d-flex gap-4 justify-content-end">
            <Button className="shadow" type="submit" name="add" value="add">
              Update Password
            </Button>
          </div>
        </Form>
      </Card>

      <Card className="shadow-sm p-4">
        <Form onSubmit={handleSubmit(handleTokenRegenerate)}>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Regenerate Token</Form.Label>
          </Form.Group>

          <div className="d-flex gap-4 justify-content-end">
            <div
              className="shadow-sm p-4"
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "#f8f9fa",
                borderRadius: "10px",
              }}
            >
              <h1 className="text-center">
                Disclaimer: This action is irreversible
              </h1>
              <h4 className="text-muted ms-2">
                Regenerating a token can result in the user being logged out
                from any other devices or sessions that were using the previous
                token. This is because the previous token is no longer valid and
                cannot be used to authenticate the user.
              </h4>
            </div>
            <Button
              className="shadow"
              variant="warning"
              onClick={handleTokenRegenerate}
            >
              Regenerate Token
            </Button>
          </div>
        </Form>
      </Card>
    </Main>
  );
};

export default Settings;
