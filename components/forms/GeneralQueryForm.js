import React from "react";
import { useForm } from "react-hook-form";

const GeneralQueryForm = ({ onSubmit }) => {
  const {
    register,
    handleSubmit,
    reset,

    formState: { errors },
  } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-3 full-width">
      <div className="mb-3 full-width ">
        <label htmlFor="content" className="form-label">
          Name
        </label>
        <input
          type="text"
          className="form-control full-width"
          placeholder="Name"
          {...register("name", { required: "Name is required" })}
        />
        {errors.name && <p className="text-danger">{errors.name.message}</p>}
      </div>
      <div className="mb-3 full-width ">
        <label htmlFor="content" className="form-label">
          Email
        </label>
        <input
          type="email"
          className="form-control full-width"
          placeholder="Email"
          {...register("email", {
            required: "Email is required",
          })}
        />
        {errors.email && <p className="text-danger">{errors.email.message}</p>}
      </div>
      <div className="mb-3 full-width ">
        <label htmlFor="content" className="form-label">
          Phone
        </label>
        <input
          type="tel"
          className="form-control full-width"
          placeholder="Phone"
          {...register("phone", {
            required: "Phone is required",
          })}
        />
        {errors.phone && <p className="text-danger">{errors.phone.message}</p>}
      </div>
      <div className="mb-3 full-width ">
        <label htmlFor="content" className="form-label">
          Message
        </label>
        <input
          type="text"
          className="form-control full-width"
          placeholder="Your message"
          {...register("message", {
            required: "Message is required",
          })}
        />
        {errors.message && (
          <p className="text-danger">{errors.message.message}</p>
        )}
      </div>
      <div className="mb-3 full-width select-form">
        <label htmlFor="content" className="form-label">
          Select Option
        </label>
        <select
        
          style={{ backgroundColor: "#2c2c2c", color: "white", outline: "none" }}
          className="form-control full-width "
          {...register("option", { required: "Option is required" })}
        >
          <option value="">reach out to us for our advertising solutions</option>
          <option value="prs">PRs - 3D ads for OOH advertising</option>
          <option value="events">Events</option>
          <option value="contentMarketing">Content Marketing</option>
        </select>
        {errors.option && <p className="text-danger">{errors.option.message}</p>}
      </div>
      <div className="d-flex align-items-baseline pt-10">
        <button type="submit" className="btn btn-primary me-2">
          Submit
        </button>
      </div>
    </form>
  );
};

export default GeneralQueryForm;
