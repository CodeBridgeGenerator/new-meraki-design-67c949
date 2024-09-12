import { AutoComplete } from "primereact/autocomplete";
import { classNames } from "primereact/utils";
import { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

const EnterDetailsStep = (props) => {
  const {
    search,
    email,
    setEmail,
    emailError,
    setEmailError,
    selectedEmails,
    isVerified,
    name,
    setName,
    nameError,
    setNameError,
    onNext,
    loading,
  } = props;

  const useUserInvite = process.env.REACT_APP_USE_USER_INVITE_SIGNUP;

  const onEnter = (e) => {
    if (e.key === "Enter") {
      onNext();
    }
  };

  return (
    <div className="w-full max-w-[400px]">
      <div className="px-3 text-center">
        <h3 className="font-semibold">Set up your account</h3>
        <p>Please enter your registered email and name to proceed.</p>
      </div>
      <div className="mt-5">
        <div className="w-full">
          <p className="m-0">Email</p>
          {useUserInvite === "true" ? (
            <AutoComplete
              type="text"
              field="emailToInvite"
              placeholder="Enter your registered email"
              value={email.emailToInvite || email}
              suggestions={selectedEmails}
              completeMethod={search}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(null);
              }}
              disabled={isVerified}
              className={classNames(emailError ? "p-invalid" : "", "w-full")}
              inputClassName="w-full"
              onKeyDown={onEnter}
            />
          ) : (
            <InputText
              className={classNames(emailError ? "p-invalid" : "", "w-full")}
              type="text"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(null);
              }}
              disabled={isVerified}
              onKeyDown={onEnter}
            />
          )}
          <small className="p-error">{emailError}</small>
        </div>
        <div className="w-full mt-5">
          <p className="m-0">Name</p>
          <InputText
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameError(null);
            }}
            disabled={isVerified}
            className={classNames(nameError ? "p-invalid" : "", "w-full")}
            onKeyDown={onEnter}
          ></InputText>
          <small className="p-error">{nameError}</small>
        </div>
      </div>
      <div className="flex mt-7 justify-content-center">
        <Button
          label="Next"
          className="w-full py-3 p-button-raised p-button-rounded"
          onClick={onNext}
          disabled={!email || !name}
          loading={loading}
        ></Button>
      </div>
    </div>
  );
};

export default EnterDetailsStep;
