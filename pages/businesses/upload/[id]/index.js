import { Card, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import ReactLoading from "react-loading";

import { Button } from "@/ui";
import { callFetch } from "@/helpers/server";
import { Main } from "@/layouts";
import { getImageUrl } from "@/helpers/clients";

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

const UploadDocuments = ({ business: serverBusiness, __state }) => {
  const router = useRouter();

  const [business, setBusiness] = useState(serverBusiness);
  const [imageLoading, setImageLoading] = useState(true);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onPanSubmit = async (data) => {
    try {
      __state.loading = true;
      const { pan_image } = data;
      const formData = new FormData();
      formData.append("image", pan_image[0]);
      const res = await fetch(
        `/api/v1/businesses/upload/${router.query.id}/pan`,
        {
          method: "PATCH",
          body: formData,
        }
      );
      const result = await res.json();
      if (res.status === 200) {
        toast.success("PAN Image uploaded successfully");
        setBusiness(result);
      }
    } catch (err) {
      toast.error("something went wrong please try agian later...");
    } finally {
      __state.loading = false;
    }
  };

  const onRegistrationSubmit = async (data) => {
    try {
      __state.loading = true;
      const { company_registration_image } = data;
      const formData = new FormData();
      formData.append("image", company_registration_image[0]);
      const res = await fetch(
        `/api/v1/businesses/upload/${router.query.id}/registration`,
        {
          method: "PATCH",
          body: formData,
        }
      );
      const result = await res.json();
      if (res.status === 200) {
        toast.success("Registration Image uploaded successfully");
        setBusiness(result);
      } else {
        toast.error(result.message);
      }
    } catch (e) {
      toast.error("something went wrong please try agian later...");
    } finally {
      __state.loading = false;
    }
  };

  return (
    <Main
      title={`Business: ${business.name} || Upload PAN and Company registration Documents `}
      icon="fa-solid fa-users"
    >
      <div className="container-fluid pb-3 ">
        <Button
          variant="outline-primary"
          size="md"
          onClick={() => router.push("/businesses")}
        >
          <i className="fa-solid fa-arrow-left mr-2"></i>Back
        </Button>
      </div>
      <Card className="shadow-sm p-4">
        <h1 className="h3 mb-3">PAN Image </h1>
        {business.pan_image && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "300px",
              }}
            >
              {imageLoading && (
                <h2 className="text-center">Loading PAN Image...</h2>
              )}
              <a
                href={`/businesses/${router.query.id}/preview-image/pan`}
                target="_blank"
              >
                <img
                  onLoad={() => setImageLoading(false)}
                  style={{
                    height: "100%",
                    width: "100%",
                  }}
                  src={getImageUrl(business.pan_image)}
                />
              </a>
            </div>
          </div>
        )}

        <Form onSubmit={handleSubmit(onPanSubmit)}>
          <Form.Group className="m-3" controlId="name">
            <Form.Control
              name="pan_image"
              type="file"
              {...register("pan_image")}
              accept="image/*"
            />
          </Form.Group>

          <div className="d-flex gap-4 justify-content-end">
            <Button className="shadow" type="submit">
              Upload PAN
            </Button>
          </div>
        </Form>
      </Card>
      <Card className="shadow-sm p-4">
        <h1 className="h3 mb-3">Registration Image </h1>
        {business.company_registration_image && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "300px",
              }}
            >
              {imageLoading && (
                <h2 className="text-center">Loading Registration Image...</h2>
              )}
              <a
                href={`/businesses/${router.query.id}/preview-image/registration`}
                target="_blank"
              >
                <img
                  onLoad={() => setImageLoading(false)}
                  style={{
                    height: "100%",
                    width: "100%",
                  }}
                  src={getImageUrl(business.company_registration_image)}
                />
              </a>
            </div>
          </div>
        )}

        <Form onSubmit={handleSubmit(onRegistrationSubmit)}>
          <Form.Group className="m-3" controlId="name">
            <Form.Control
              name="company_registration_image"
              type="file"
              {...register("company_registration_image")}
              accept="image/*"
            />
          </Form.Group>

          <div className="d-flex gap-4 justify-content-end">
            <Button className="shadow" type="submit">
              Upload Registration
            </Button>
          </div>
        </Form>
      </Card>
    </Main>
  );
};

export default UploadDocuments;
